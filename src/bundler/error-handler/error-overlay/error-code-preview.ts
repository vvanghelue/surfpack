import type { RunnerSourceFile } from "../../source-file.js";

export interface CodePreview {
  fileName: string;
  startLine: number;
  lines: CodeLine[];
}

export interface CodeLine {
  lineNumber: number;
  content: string;
  isErrorLine: boolean;
  errorColumn?: number;
}

/**
 * Finds a source file by its normalized path
 */
const findSourceFile = (
  filePath: string,
  sourceFiles: ReadonlyArray<RunnerSourceFile>
): RunnerSourceFile | null => {
  // Remove namespace prefixes like "virtual:", "file:", etc.
  let cleanPath = filePath.replace(/^[a-zA-Z]+:/, "");

  // Normalize the path by removing leading slashes and ./
  cleanPath = cleanPath.replace(/^\.?\//, "");

  for (const file of sourceFiles) {
    const filePathNormalized = file.path.replace(/^\.?\//, "");
    if (
      filePathNormalized === cleanPath ||
      file.path === filePath ||
      file.path === cleanPath
    ) {
      return file;
    }
  }

  return null;
};

/**
 * Creates a code preview showing lines around an error location
 */
export const createCodePreview = (
  fileName: string,
  errorLine: number,
  errorColumn: number,
  sourceFiles: ReadonlyArray<RunnerSourceFile>,
  contextLines: number = 5
): CodePreview | null => {
  const file = findSourceFile(fileName, sourceFiles);
  if (!file || !file.content) {
    return null;
  }

  const lines = file.content.split("\n");
  const startLine = Math.max(1, errorLine - contextLines);
  const endLine = Math.min(lines.length, errorLine + contextLines);

  const previewLines: CodeLine[] = [];

  for (let i = startLine; i <= endLine; i++) {
    const lineContent = lines[i - 1] || ""; // Lines are 1-indexed
    previewLines.push({
      lineNumber: i,
      content: lineContent,
      isErrorLine: i === errorLine,
      errorColumn: i === errorLine ? errorColumn : undefined,
    });
  }

  return {
    fileName,
    startLine,
    lines: previewLines,
  };
};

/**
 * Escapes HTML special characters
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/**
 * Simple syntax highlighting for JavaScript/TypeScript
 * Note: Expects already-escaped HTML input
 */
const highlightSyntax = (escapedCode: string): string => {
  let highlighted = escapedCode;

  // Comments (do first to avoid highlighting keywords in comments)
  highlighted = highlighted.replace(
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    '<span style="color: #5c6370; font-style: italic;">$1</span>'
  );

  // Strings - match escaped quotes
  highlighted = highlighted.replace(
    /(&#39;(?:[^&#39;\\]|\\.)*?&#39;|&quot;(?:[^&quot;\\]|\\.)*?&quot;|`(?:[^`\\]|\\.)*?`)/g,
    '<span style="color: #98c379;">$1</span>'
  );

  // Keywords (avoid already highlighted content by using negative lookahead for span tags)
  highlighted = highlighted.replace(
    /\b(const|let|var|function|async|await|return|if|else|for|while|class|extends|import|export|from|default|try|catch|throw|new|typeof|instanceof|this|super|static|public|private|protected|interface|type|enum)\b(?![^<]*<\/span>)/g,
    '<span style="color: #c678dd;">$1</span>'
  );

  // Numbers
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*)\b(?![^<]*<\/span>)/g,
    '<span style="color: #d19a66;">$1</span>'
  );

  return highlighted;
};

/**
 * Renders a code preview as HTML
 */
export const renderCodePreviewHtml = (preview: CodePreview): string => {
  const lines = preview.lines
    .map((line) => {
      const lineNumWidth = "60px";
      const lineNumColor = line.isErrorLine ? "#ff5555" : "#666";
      const bgColor = line.isErrorLine
        ? "rgba(255, 85, 85, 0.1)"
        : "transparent";
      const borderLeft = line.isErrorLine
        ? "3px solid #ff5555"
        : "3px solid transparent";

      const escapedContent = escapeHtml(line.content);
      const highlightedContent = highlightSyntax(escapedContent);

      let errorPointer = "";
      if (
        line.isErrorLine &&
        line.errorColumn !== undefined &&
        line.errorColumn > 0
      ) {
        const spaces = " ".repeat(Math.max(0, line.errorColumn - 1));
        errorPointer = `
          <div style="
            padding-left: ${lineNumWidth};
            color: #ff5555;
            font-weight: bold;
            background: ${bgColor};
            border-left: ${borderLeft};
            padding-top: 2px;
            padding-bottom: 2px;
          ">
            ${escapeHtml(spaces)}^
          </div>
        `;
      }

      return `
        <div style="
          display: flex;
          background: ${bgColor};
          border-left: ${borderLeft};
          padding-top: 2px;
          padding-bottom: 2px;
        ">
          <span style="
            display: inline-block;
            width: ${lineNumWidth};
            text-align: right;
            padding-right: 12px;
            color: ${lineNumColor};
            user-select: none;
            font-weight: ${line.isErrorLine ? "bold" : "normal"};
            flex-shrink: 0;
          ">${line.lineNumber}</span>
          <span style="white-space: pre; flex: 1;">${highlightedContent}</span>
        </div>
        ${errorPointer}
      `;
    })
    .join("");

  return `
    <div style="
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      background: rgba(30, 30, 30, 0.95);
      border-radius: 8px;
      padding: 16px 0;
      overflow-x: auto;
    ">
      <div style="
        padding: 0 16px 12px 16px;
        color: #abb2bf;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 8px;
      ">
        ${escapeHtml(preview.fileName)}
      </div>
      ${lines}
    </div>
  `;
};
