import React, { useRef } from "react";
import type { RunnerFile } from "../../../index.js";
import { useCodeMirror } from "../../hooks/useCodeMirror.js";
import { FileTabs } from "./FileTabs.js";

export type CodeEditorProps = {
  file?: RunnerFile;
  theme: "light" | "dark" | "device-settings";
  debounceDelay?: number;
  onChange?: (file: RunnerFile) => void;
  onSelectFileFromTabs: (filePath: string | null) => void;
  selectedFilePath?: string | null;
};

export function CodeEditor({
  file,
  theme,
  debounceDelay = 700,
  onChange,
  onSelectFileFromTabs,
  selectedFilePath,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openedFiles, setOpenedFiles] = React.useState<string[]>(
    file ? [file.path] : []
  );

  React.useEffect(() => {
    if (file && containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
    // push file in openedFiles array
    setOpenedFiles((prevOpenedFiles) => {
      if (file && !prevOpenedFiles.includes(file.path)) {
        return [...prevOpenedFiles, file.path];
      }
      return prevOpenedFiles;
    });
  }, [file]);

  useCodeMirror({
    containerRef,
    file,
    theme,
    debounceDelay,
    onChange,
  });

  return (
    <div
      className="surfpack-code-editor-container"
      style={{ height: "100%", width: "100%" }}
    >
      <FileTabs
        openedFiles={openedFiles}
        selectedFile={selectedFilePath}
        onSelectFile={(newSelectedFilePath) => {
          onSelectFileFromTabs(newSelectedFilePath);
        }}
        onCloseFile={(closedFilePath) => {
          const newOpenedFiles = openedFiles.filter(
            (file) => file !== closedFilePath
          );
          setOpenedFiles(newOpenedFiles);

          if (file?.path === closedFilePath) {
            const lastOpenedFile =
              newOpenedFiles[newOpenedFiles.length - 1] || null;
            if (lastOpenedFile) {
              onSelectFileFromTabs(lastOpenedFile);
            } else {
              onSelectFileFromTabs(null);
            }
          }
        }}
      />
      <div
        ref={containerRef}
        className="surfpack-code-editor-view"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
