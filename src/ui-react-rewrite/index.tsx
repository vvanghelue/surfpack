import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { AppShell } from "./components/AppShell";
import type { RunnerFile } from "../index.js"; // existing export
import type { UiOptions, UiComponent } from "../ui/ui.js"; // reuse existing types for parity
import type { FileBrowser as LegacyFileBrowser } from "../ui/file-browser.js";
import type { CodeEditor as LegacyCodeEditor } from "../ui/code-editor.js";
import type { Navigator as LegacyNavigator } from "../ui/navigator.js";

function toPathname(rawUrl: string) {
  if (!rawUrl || rawUrl === "about:blank") {
    return "/";
  }

  try {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      const parsed = new URL(rawUrl);
      return parsed.pathname || "/";
    }

    const cleaned = rawUrl.split("?")[0].split("#")[0];
    if (cleaned.startsWith("/")) {
      return cleaned || "/";
    }

    return `/${cleaned}`;
  } catch (error) {
    return "/";
  }
}

function upsertFile(collection: RunnerFile[], next: RunnerFile): RunnerFile[] {
  const index = collection.findIndex(
    (candidate) => candidate.path === next.path
  );
  if (index === -1) {
    return [...collection, next];
  }

  const existing = collection[index];
  if (
    existing === next ||
    (existing.content === next.content && existing.path === next.path)
  ) {
    return collection;
  }

  const updated = collection.slice();
  updated[index] = next;
  return updated;
}

// Adapter similar to createUi but mounting React version
export function createUiReact(
  container: HTMLElement,
  options: UiOptions = {},
  onFileChange?: (file: RunnerFile) => void
): UiComponent {
  const rootEl = document.createElement("div");
  container.appendChild(rootEl);
  const root: Root = createRoot(rootEl);
  const state = {
    options: { ...options },
    files: [] as RunnerFile[],
    activeFilePath: null as string | null,
    navigatorValue: "/",
  };

  const navigatorCallbacks = {
    onRefresh: undefined as (() => void) | undefined,
    onNavigate: undefined as ((route: string) => void) | undefined,
  };

  let previewContainer: HTMLDivElement | null = null;
  let uiComponent: UiComponent;
  let codeEditorAdapter: LegacyCodeEditor | undefined;
  let navigatorAdapter: LegacyNavigator | undefined;

  const providePreviewContainer = (el: HTMLDivElement) => {
    previewContainer = el;
    if (uiComponent) {
      uiComponent.previewContainer = el;
    }
  };

  const handleFileOpen = (file: RunnerFile) => {
    applyFileChange(file, { notify: false, forceActive: true });
    fileBrowserAdapter.onFileSelect?.(file);
  };

  const handleFileChange = (file: RunnerFile) => {
    applyFileChange(file, { notify: true });
  };

  const handleNavigatorInputChange = (value: string) => {
    state.navigatorValue = value;
    rerender();
  };

  const handleNavigatorNavigate = (route: string) => {
    navigatorCallbacks.onNavigate?.(route);
  };

  const handleNavigatorRefresh = () => {
    navigatorCallbacks.onRefresh?.();
  };

  function rerender() {
    root.render(
      <AppShell
        {...state.options}
        files={state.files}
        activeFilePath={state.activeFilePath}
        navigatorUrl={state.navigatorValue}
        onFileOpen={handleFileOpen}
        onFileChange={handleFileChange}
        onNavigatorInputChange={handleNavigatorInputChange}
        onNavigate={handleNavigatorNavigate}
        onRefresh={handleNavigatorRefresh}
        providePreviewContainer={providePreviewContainer}
      />
    );
  }

  const applyFileChange = (
    file: RunnerFile,
    { notify, forceActive = false }: { notify: boolean; forceActive?: boolean }
  ) => {
    const nextFiles = upsertFile(state.files, file);
    const filesChanged = nextFiles !== state.files;

    const shouldUpdateActive =
      forceActive ||
      state.activeFilePath === null ||
      state.activeFilePath === file.path;
    const activePathChanged =
      shouldUpdateActive && state.activeFilePath !== file.path;

    if (filesChanged) {
      state.files = nextFiles;
    }

    if (activePathChanged) {
      state.activeFilePath = file.path;
    }

    if (filesChanged || activePathChanged) {
      rerender();
    }

    if (notify && filesChanged) {
      onFileChange?.(file);
    }
  };

  const fileBrowserAdapter = {
    onFileSelect: undefined as ((file: RunnerFile) => void) | undefined,
    setFiles(files: RunnerFile[]) {
      state.files = [...files];
      if (
        state.activeFilePath &&
        !state.files.some(
          (candidate) => candidate.path === state.activeFilePath
        )
      ) {
        state.activeFilePath = files[0]?.path ?? null;
      }
      rerender();
    },
    selectFile(path: string) {
      const file = state.files.find((f) => f.path === path);
      if (file) {
        handleFileOpen(file);
      } else {
        state.activeFilePath = path;
        rerender();
      }
    },
    destroy() {
      // No-op for now; React handles cleanup via destroy()
    },
  } as unknown as LegacyFileBrowser;

  codeEditorAdapter = {
    loadFile(file: RunnerFile) {
      applyFileChange(file, { notify: false, forceActive: true });
    },
    setTheme(theme: "light" | "dark" | "device-settings") {
      state.options.theme = theme;
      rerender();
    },
    updateContent(content: string) {
      if (!state.activeFilePath) {
        return;
      }
      const file = state.files.find(
        (candidate) => candidate.path === state.activeFilePath
      );
      if (!file) {
        return;
      }
      const updated: RunnerFile = { ...file, content };
      applyFileChange(updated, { notify: false });
    },
    getCurrentFile() {
      if (!state.activeFilePath) {
        return null;
      }
      return (
        state.files.find(
          (candidate) => candidate.path === state.activeFilePath
        ) ?? null
      );
    },
    destroy() {
      // React handles cleanup via uiComponent.destroy
    },
  } as unknown as LegacyCodeEditor;

  navigatorAdapter = {
    setUrl(url: string) {
      state.navigatorValue = toPathname(url);
      rerender();
    },
    onRefresh(callback: () => void) {
      navigatorCallbacks.onRefresh = callback;
    },
    onNavigate(callback: (route: string) => void) {
      navigatorCallbacks.onNavigate = callback;
    },
    getCurrentRoute() {
      return state.navigatorValue || "/";
    },
    destroy() {
      navigatorCallbacks.onRefresh = undefined;
      navigatorCallbacks.onNavigate = undefined;
    },
  } as unknown as LegacyNavigator;

  uiComponent = {
    container: rootEl,
    fileBrowser: fileBrowserAdapter,
    codeEditor: codeEditorAdapter,
    navigator: navigatorAdapter,
    previewContainer: previewContainer || rootEl,
    setTheme(theme) {
      state.options.theme = theme;
      rerender();
    },
    toggleCodeEditor(show) {
      state.options.showCodeEditor = show;
      rerender();
    },
    toggleFileBrowser(show) {
      state.options.showFileBrowser = show;
      rerender();
    },
    toggleNavigator(show) {
      state.options.showNavigator = show;
      rerender();
    },
    destroy() {
      navigatorAdapter?.destroy();
      codeEditorAdapter?.destroy();
      root.unmount();
      if (container.contains(rootEl)) container.removeChild(rootEl);
    },
  } as UiComponent;

  rerender();

  return uiComponent;
}

export type SurfpackUIProps = UiOptions & {
  files: RunnerFile[];
  activeFilePath?: string | null;
  onFileOpen?: (file: RunnerFile) => void;
  onFileChange?: (file: RunnerFile) => void;
  navigatorUrl?: string;
  onNavigatorInputChange?: (value: string) => void;
  onNavigate?: (route: string) => void;
  onRefresh?: () => void;
  onPreviewContainerReady?: (el: HTMLDivElement) => void;
};

export const SurfpackUI = React.forwardRef<HTMLDivElement, SurfpackUIProps>(
  function SurfpackUI(
    {
      files: incomingFiles,
      activeFilePath,
      onFileOpen,
      onFileChange,
      navigatorUrl,
      onNavigatorInputChange,
      onNavigate,
      onRefresh,
      onPreviewContainerReady,
      ...uiOptions
    },
    forwardedRef
  ) {
    const [files, setFiles] = useState<RunnerFile[]>(incomingFiles);
    useEffect(() => {
      setFiles(incomingFiles);
    }, [incomingFiles]);

    const activePathControlled = activeFilePath !== undefined;
    const [internalActivePath, setInternalActivePath] = useState<string | null>(
      () => activeFilePath ?? incomingFiles[0]?.path ?? null
    );

    useEffect(() => {
      if (activePathControlled) {
        setInternalActivePath(activeFilePath ?? null);
      }
    }, [activePathControlled, activeFilePath]);

    useEffect(() => {
      if (activePathControlled) {
        return;
      }
      setInternalActivePath((current) => {
        if (current && files.some((candidate) => candidate.path === current)) {
          return current;
        }
        return files[0]?.path ?? null;
      });
    }, [files, activePathControlled]);

    const navigatorControlled = navigatorUrl !== undefined;
    const [internalNavigatorValue, setInternalNavigatorValue] =
      useState<string>(() => navigatorUrl ?? "/");

    useEffect(() => {
      if (navigatorControlled) {
        setInternalNavigatorValue(navigatorUrl ?? "/");
      }
    }, [navigatorControlled, navigatorUrl]);

    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const updateForwardedRef = useCallback(
      (instance: HTMLDivElement | null) => {
        if (!forwardedRef) {
          return;
        }
        if (typeof forwardedRef === "function") {
          forwardedRef(instance);
        } else {
          forwardedRef.current = instance;
        }
      },
      [forwardedRef]
    );

    const handleProvidePreviewContainer = useCallback(
      (element: HTMLDivElement) => {
        previewContainerRef.current = element;
        updateForwardedRef(element);
        onPreviewContainerReady?.(element);
      },
      [onPreviewContainerReady, updateForwardedRef]
    );

    useEffect(() => {
      return () => {
        previewContainerRef.current = null;
        updateForwardedRef(null);
      };
    }, [updateForwardedRef]);

    const effectiveActivePath = activePathControlled
      ? (activeFilePath ?? null)
      : internalActivePath;

    const effectiveNavigatorValue = navigatorControlled
      ? (navigatorUrl ?? "/")
      : internalNavigatorValue;

    const handleFileOpenInternal = useCallback(
      (file: RunnerFile) => {
        if (!activePathControlled) {
          setInternalActivePath(file.path);
        }
        onFileOpen?.(file);
      },
      [activePathControlled, onFileOpen]
    );

    const handleFileChangeInternal = useCallback(
      (file: RunnerFile) => {
        setFiles((previous) => upsertFile(previous, file));
        if (!activePathControlled) {
          setInternalActivePath(file.path);
        }
        onFileChange?.(file);
      },
      [activePathControlled, onFileChange]
    );

    const handleNavigatorInputChangeInternal = useCallback(
      (value: string) => {
        if (!navigatorControlled) {
          setInternalNavigatorValue(value);
        }
        onNavigatorInputChange?.(value);
      },
      [navigatorControlled, onNavigatorInputChange]
    );

    return (
      <AppShell
        {...uiOptions}
        files={files}
        activeFilePath={effectiveActivePath}
        onFileOpen={handleFileOpenInternal}
        onFileChange={handleFileChangeInternal}
        onNavigatorInputChange={handleNavigatorInputChangeInternal}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
        navigatorUrl={effectiveNavigatorValue}
        providePreviewContainer={handleProvidePreviewContainer}
      />
    );
  }
);

export type { AppShellProps } from "./components/AppShell";
