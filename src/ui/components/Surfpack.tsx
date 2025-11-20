import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RunnerFile } from "../../index.js";
import type { UiTheme } from "../types.js";
import { applyUiStyles } from "../styles/ui.style.css.js";
import { applyCodeMirrorStyles } from "../styles/codemirror.style.css.js";
import { FileBrowser } from "./FileBrowser/FileBrowser.js";
import { CodeEditor } from "./CodeEditor/CodeEditor.js";
import { Preview } from "./Preview/Preview.js";
import { ResizeHandle } from "./Resizer/ResizeHandle.js";
import { useHorizontalResizers } from "../hooks/useHorizontalResizers.js";
import {
  DetailedNormalizedError,
  ErrorOverlaySetup,
} from "../../bundler/error-handler/global-error-handler.js";

export type SurfpackProps = {
  bundlerUrl: string;
  files: RunnerFile[];
  entryFile?: string;
  theme?: UiTheme;
  width?: number | string;
  height?: number | string;
  showCodeEditor?: boolean;
  showFileBrowser?: boolean;
  showNavigator?: boolean;
  codeEditorInitialWidth?: number;
  fileBrowserDefaultExpanded?: boolean;
  debounceDelay?: number;
  activeFilePath?: string | null;
  onIframeReady?: () => void;
  showErrorOverlay?: boolean;
  errorOverlayErrors?: ErrorOverlaySetup;
  onError?: (error: DetailedNormalizedError) => void;
};

export function Surfpack(props: SurfpackProps) {
  const {
    files = [],
    theme = "device-settings",
    width = "100%",
    height = "100%",
    showCodeEditor = true,
    showFileBrowser = true,
    showNavigator = true,
    fileBrowserDefaultExpanded = true,
    codeEditorInitialWidth,
    debounceDelay = 700,
    showErrorOverlay = true,
    onError,
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileBrowserContainerRef = useRef<HTMLDivElement | null>(null);
  const codeEditorContainerRef = useRef<HTMLDivElement | null>(null);
  const previewAreaRef = useRef<HTMLDivElement | null>(null);
  const [internalActivePath, setInternalActivePath] = useState(
    props.activeFilePath
  );
  const [internalFiles, setInternalFiles] = useState<RunnerFile[]>(files);

  React.useEffect(() => {
    setInternalFiles(files);
  }, [files]);

  React.useEffect(() => {
    if (props.activeFilePath !== undefined) {
      setInternalActivePath(props.activeFilePath);
    }
  }, [props.activeFilePath]);

  const activeFile = files.find(
    (candidate) => candidate.path === internalActivePath
  );

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

  useEffect(() => {
    if (props.activeFilePath !== undefined) {
      setInternalActivePath(props.activeFilePath);
    }
  }, [props.activeFilePath]);

  function handleFileOpen(file: RunnerFile) {
    setInternalActivePath(file.path);
  }

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
            files={internalFiles}
            activePath={internalActivePath}
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
            onChange={(file: RunnerFile) => {
              // should find and replace the file in the files array, if it dont exists, it add it
              const newFiles = [...internalFiles];
              const index = newFiles.findIndex(
                (candidate) => candidate.path === file.path
              );
              if (index !== -1) {
                newFiles[index] = file;
              } else {
                newFiles.push(file);
              }
              setInternalFiles(newFiles);
            }}
          />
        ) : null}
      </div>
      <ResizeHandle
        hidden={!(showCodeEditor || showFileBrowser)}
        {...rightHandleProps}
      />
      <Preview
        initialRoute="/"
        files={internalFiles}
        entryFile={props.entryFile}
        bundlerUrl={props.bundlerUrl}
        areaRef={previewAreaRef}
        showNavigator={!!props.showNavigator}
        showErrorOverlay={showErrorOverlay}
        errorOverlayErrors={props.errorOverlayErrors}
        onError={onError}
      />
    </div>
  );
}
