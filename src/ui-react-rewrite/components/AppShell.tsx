import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RunnerFile } from "../../index.js";
import type { UiOptions } from "../types.js";
// We will initially reuse CSS-in-TS from the existing UI to keep parity.
import { applyUiStyles } from "../styles/ui.style.css.js";
import { applyCodeMirrorStyles } from "../styles/codemirror.style.css.js";
import { FileBrowser } from "./FileBrowser/FileBrowser";
import { CodeEditor } from "./CodeEditor/CodeEditor";
import { Navigator as NavigatorBar } from "./Navigator/Navigator";
import { Preview } from "./Preview/Preview";
import { ResizeHandle } from "./Resizer/ResizeHandle";
import { useHorizontalResizers } from "../hooks/useHorizontalResizers";

export type AppShellProps = UiOptions & {
  files?: RunnerFile[];
  activeFilePath?: string | null;
  onFileOpen?: (file: RunnerFile) => void;
  onFileChange?: (file: RunnerFile) => void;
  onNavigate?: (route: string) => void;
  onRefresh?: () => void;
  onNavigatorInputChange?: (value: string) => void;
  navigatorUrl?: string;
  providePreviewContainer?: (el: HTMLDivElement) => void;
};

export function AppShell(props: AppShellProps) {
  const {
    theme = "device-settings",
    width = "100%",
    height = "100%",
    showCodeEditor = true,
    showFileBrowser = true,
    showNavigator = true,
    fileBrowserDefaultExpanded = true,
    codeEditorInitialWidth,
    debounceDelay = 700,
    navigatorUrl,
  } = props;

  const files = props.files ?? [];
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileBrowserContainerRef = useRef<HTMLDivElement | null>(null);
  const codeEditorContainerRef = useRef<HTMLDivElement | null>(null);
  const previewAreaRef = useRef<HTMLDivElement | null>(null);
  const previewIframeContainerRef = useRef<HTMLDivElement | null>(null);
  const [internalActivePath, setInternalActivePath] = useState<string | null>(
    null
  );
  const [navigatorInputValue, setNavigatorInputValue] = useState<string>(
    navigatorUrl ?? "/"
  );

  const resolvedActivePath =
    props.activeFilePath !== undefined
      ? props.activeFilePath
      : internalActivePath;
  const activeFile = useMemo(() => {
    if (!resolvedActivePath) {
      return null;
    }
    return (
      files.find((candidate) => candidate.path === resolvedActivePath) ?? null
    );
  }, [files, resolvedActivePath]);

  // Apply global styles once
  useEffect(() => {
    applyUiStyles();
    applyCodeMirrorStyles();
  }, []);

  // Theme class handling on the root container
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.classList.remove("dark-mode", "light-mode");
    if (theme === "dark") el.classList.add("dark-mode");
    else if (theme === "light") el.classList.add("light-mode");
  }, [theme]);

  // Provide preview container back to the adapter
  useEffect(() => {
    if (props.providePreviewContainer && previewIframeContainerRef.current) {
      props.providePreviewContainer(previewIframeContainerRef.current);
    }
  }, [props.providePreviewContainer]);

  useEffect(() => {
    if (props.activeFilePath !== undefined) {
      setInternalActivePath(props.activeFilePath);
    }
  }, [props.activeFilePath]);

  useEffect(() => {
    if (navigatorUrl !== undefined) {
      setNavigatorInputValue(navigatorUrl || "/");
    }
  }, [navigatorUrl]);

  const handleFileOpen = useCallback(
    (file: RunnerFile) => {
      if (props.activeFilePath === undefined) {
        setInternalActivePath(file.path);
      }
      props.onFileOpen?.(file);
    },
    [props.activeFilePath, props.onFileOpen]
  );

  const handleNavigatorInputChange = useCallback(
    (value: string) => {
      setNavigatorInputValue(value);
      props.onNavigatorInputChange?.(value);
    },
    [props.onNavigatorInputChange]
  );

  const handleNavigate = useCallback(
    (route: string) => {
      props.onNavigate?.(route);
    },
    [props.onNavigate]
  );

  const handleRefresh = useCallback(() => {
    props.onRefresh?.();
  }, [props.onRefresh]);

  const style = useMemo(() => {
    const resolved: React.CSSProperties = {};
    if (width !== undefined) {
      resolved.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      resolved.height = typeof height === "number" ? `${height}px` : height;
    }
    return resolved;
  }, [width, height]);

  const { leftHandleProps, rightHandleProps } = useHorizontalResizers({
    mainRef: rootRef,
    previewRef: previewAreaRef,
    fileBrowserRef: fileBrowserContainerRef,
    codeEditorRef: codeEditorContainerRef,
    fileBrowserVisible: showFileBrowser,
    codeEditorVisible: showCodeEditor,
    handleWidth: 6,
    minFileBrowser: 150,
    minEditor: 200,
    minPreview: 200,
  });

  useEffect(() => {
    if (fileBrowserContainerRef.current) {
      fileBrowserContainerRef.current.style.flex = "0 0 auto";
    }
  }, []);

  const appliedInitialWidthRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (
      codeEditorInitialWidth !== undefined &&
      codeEditorContainerRef.current
    ) {
      if (appliedInitialWidthRef.current === codeEditorInitialWidth) {
        return;
      }
      codeEditorContainerRef.current.style.width = `${codeEditorInitialWidth}px`;
      codeEditorContainerRef.current.style.flex = "0 0 auto";
      appliedInitialWidthRef.current = codeEditorInitialWidth;
    }
  }, [codeEditorInitialWidth]);

  const navigatorNode = showNavigator ? (
    <NavigatorBar
      route={navigatorInputValue}
      onRouteChange={handleNavigatorInputChange}
      onNavigate={handleNavigate}
      onRefresh={handleRefresh}
    />
  ) : null;

  return (
    <div
      ref={rootRef}
      className="surfpack-ui"
      style={style as React.CSSProperties}
    >
      <div
        ref={fileBrowserContainerRef}
        className="surfpack-file-browser"
        style={{ display: showFileBrowser ? "" : "none" }}
      >
        {showFileBrowser ? (
          <FileBrowser
            className="surfpack-file-browser"
            files={files}
            activePath={resolvedActivePath}
            defaultExpanded={fileBrowserDefaultExpanded}
            onSelect={handleFileOpen}
          />
        ) : null}
      </div>
      <ResizeHandle
        hidden={!(showFileBrowser && showCodeEditor)}
        {...leftHandleProps}
      />
      <div
        ref={codeEditorContainerRef}
        className="surfpack-code-editor"
        style={{ display: showCodeEditor ? "" : "none" }}
      >
        {showCodeEditor ? (
          <CodeEditor
            file={activeFile}
            theme={theme}
            debounceDelay={debounceDelay}
            onChange={props.onFileChange}
          />
        ) : null}
      </div>
      <ResizeHandle
        hidden={!(showCodeEditor || showFileBrowser)}
        {...rightHandleProps}
      />
      <Preview
        areaRef={previewAreaRef}
        containerRef={previewIframeContainerRef}
        showNavigator={showNavigator}
        navigator={navigatorNode}
      />
    </div>
  );
}
