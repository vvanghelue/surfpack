import React, { useRef } from "react";
import type { RunnerFile } from "../../../index.js";
import { useCodeMirror } from "../../hooks/useCodeMirror.js";

export type CodeEditorProps = {
  file?: RunnerFile;
  theme: "light" | "dark" | "device-settings";
  debounceDelay?: number;
  onChange?: (file: RunnerFile) => void;
};

export function CodeEditor({
  file,
  theme,
  debounceDelay = 700,
  onChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useCodeMirror({
    containerRef,
    file,
    theme,
    debounceDelay,
    onChange,
  });

  return (
    <div
      ref={containerRef}
      className="surfpack-code-editor-view"
      style={{ height: "100%", width: "100%" }}
    />
  );
}
