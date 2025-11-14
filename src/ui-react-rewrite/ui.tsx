import React from "react";
import { createRoot, Root } from "react-dom/client";
import { AppShell } from "./components/AppShell";
import type { RunnerFile } from "../index.js";
import type {
  UiOptions,
  UiComponent,
  FileBrowserAdapter,
  CodeEditorAdapter,
  NavigatorAdapter,
  UiTheme,
} from "./types.js";
import type { AppShellProps } from "./components/AppShell";

type UiState = {
  options: UiOptions;
  files: RunnerFile[];
  activeFilePath: string | null;
  navigatorValue: string;
  previewContainer: HTMLElement;
};

type NavigatorCallbacks = {
  onRefresh?: () => void;
  onNavigate?: (route: string) => void;
};

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

function ensureActivePath(state: UiState) {
  if (
    state.activeFilePath &&
    state.files.some((candidate) => candidate.path === state.activeFilePath)
  ) {
    return;
  }

  state.activeFilePath = state.files[0]?.path ?? null;
}

function rerender(
  root: Root,
  state: UiState,
  callbacks: {
    onFileOpen: (file: RunnerFile) => void;
    onFileChange: (file: RunnerFile) => void;
    onNavigatorInputChange: (value: string) => void;
    onNavigate: (route: string) => void;
    onRefresh: () => void;
    onPreviewContainerReady: (element: HTMLDivElement) => void;
  }
) {
  const props: AppShellProps = {
    ...state.options,
    files: state.files,
    activeFilePath: state.activeFilePath,
    navigatorUrl: state.navigatorValue,
    onFileOpen: callbacks.onFileOpen,
    onFileChange: callbacks.onFileChange,
    onNavigatorInputChange: callbacks.onNavigatorInputChange,
    onNavigate: callbacks.onNavigate,
    onRefresh: callbacks.onRefresh,
    providePreviewContainer: callbacks.onPreviewContainerReady,
  };

  root.render(React.createElement(AppShell, props));
}

export function createUiReact(
  container: HTMLElement,
  options: UiOptions = {},
  onFileChange?: (file: RunnerFile) => void
): UiComponent {
  const rootElement = document.createElement("div");
  container.appendChild(rootElement);
  const root: Root = createRoot(rootElement);

  const state: UiState = {
    options: { ...options },
    files: [],
    activeFilePath: null,
    navigatorValue: "/",
    previewContainer: rootElement,
  };

  const navigatorCallbacks: NavigatorCallbacks = {};
  let onFileSelectCallback: FileBrowserAdapter["onFileSelect"];

  const triggerRender = () => {
    rerender(root, state, {
      onFileOpen(file) {
        state.activeFilePath = file.path;
        onFileSelectCallback?.(file);
        triggerRender();
      },
      onFileChange(file) {
        state.files = upsertFile(state.files, file);
        state.activeFilePath = file.path;
        triggerRender();
        onFileChange?.(file);
      },
      onNavigatorInputChange(value) {
        state.navigatorValue = value;
        triggerRender();
      },
      onNavigate(route) {
        navigatorCallbacks.onNavigate?.(route);
      },
      onRefresh() {
        navigatorCallbacks.onRefresh?.();
      },
      onPreviewContainerReady(element) {
        state.previewContainer = element;
        ui.previewContainer = element;
      },
    });
  };

  const fileBrowserAdapter: FileBrowserAdapter = {
    setFiles(files: RunnerFile[]) {
      state.files = [...files];
      ensureActivePath(state);
      triggerRender();
    },
    selectFile(path: string) {
      const file = state.files.find((candidate) => candidate.path === path);
      if (file) {
        state.activeFilePath = file.path;
        onFileSelectCallback?.(file);
      } else {
        state.activeFilePath = path;
      }
      triggerRender();
    },
    destroy() {
      onFileSelectCallback = undefined;
    },
  };

  Object.defineProperty(fileBrowserAdapter, "onFileSelect", {
    configurable: true,
    enumerable: true,
    get() {
      return onFileSelectCallback;
    },
    set(callback: FileBrowserAdapter["onFileSelect"]) {
      onFileSelectCallback = callback;
    },
  });

  const codeEditorAdapter: CodeEditorAdapter = {
    loadFile(file: RunnerFile) {
      state.files = upsertFile(state.files, file);
      state.activeFilePath = file.path;
      triggerRender();
    },
    setTheme(theme: UiTheme) {
      state.options.theme = theme;
      triggerRender();
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
      state.files = upsertFile(state.files, updated);
      triggerRender();
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
      // nothing to clean up
    },
  };

  const navigatorAdapter: NavigatorAdapter = {
    setUrl(url: string) {
      state.navigatorValue = toPathname(url);
      triggerRender();
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
  };

  const ui: UiComponent = {
    container: rootElement,
    fileBrowser: fileBrowserAdapter,
    codeEditor: codeEditorAdapter,
    navigator: navigatorAdapter,
    previewContainer: state.previewContainer,
    setTheme(theme: UiTheme) {
      state.options.theme = theme;
      triggerRender();
    },
    toggleCodeEditor(show) {
      state.options.showCodeEditor = show;
      triggerRender();
    },
    toggleFileBrowser(show) {
      state.options.showFileBrowser = show;
      triggerRender();
    },
    toggleNavigator(show) {
      state.options.showNavigator = show;
      triggerRender();
    },
    destroy() {
      navigatorAdapter.destroy();
      fileBrowserAdapter.destroy();
      codeEditorAdapter.destroy();
      root.unmount();
      if (container.contains(rootElement)) {
        container.removeChild(rootElement);
      }
    },
  };

  triggerRender();

  return ui;
}

export type SurfpackUIProps = AppShellProps;
export { AppShell as SurfpackUI };
export { AppShell };
export type { AppShellProps };
export { createUiReact as createUi };
