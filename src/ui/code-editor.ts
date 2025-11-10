import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import type { RunnerFile } from "../index.js";

export class CodeEditor {
  private container: HTMLElement;
  private view: EditorView | null = null;
  private currentFile: RunnerFile | null = null;
  private onFileChange?: (file: RunnerFile) => void;

  constructor(
    container: HTMLElement,
    onFileChange?: (file: RunnerFile) => void
  ) {
    this.container = container;
    this.onFileChange = onFileChange;
    this.initializeEditor();
  }

  private initializeEditor(): void {
    if (this.view) {
      this.view.destroy();
    }

    this.view = new EditorView({
      parent: this.container,
      doc: this.currentFile?.content || "",
      extensions: [
        basicSetup,
        javascript({ jsx: true, typescript: true }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && this.currentFile && this.onFileChange) {
            this.currentFile.content = update.state.doc.toString();
            this.onFileChange(this.currentFile);
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
          },
          ".cm-editor": {
            height: "100%",
          },
          ".cm-scroller": {
            fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
            fontSize: "14px",
          },
        }),
      ],
    });
  }

  loadFile(file: RunnerFile): void {
    this.currentFile = file;

    if (this.view) {
      this.view.dispatch({
        changes: {
          from: 0,
          to: this.view.state.doc.length,
          insert: file.content,
        },
      });
    }
  }

  getCurrentFile(): RunnerFile | null {
    return this.currentFile;
  }

  updateContent(content: string): void {
    if (this.view) {
      this.view.dispatch({
        changes: {
          from: 0,
          to: this.view.state.doc.length,
          insert: content,
        },
      });
    }
  }

  destroy(): void {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }
}
