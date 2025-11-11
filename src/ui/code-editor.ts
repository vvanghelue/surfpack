import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import type { RunnerFile } from "../index.js";
import { debounce } from "../utils/debounce.js";

export class CodeEditor {
  private container: HTMLElement;
  private view: EditorView | null = null;
  private currentFile: RunnerFile | null = null;
  private onFileChange?: (file: RunnerFile) => void;
  private currentTheme: "light" | "dark" | "device-settings" =
    "device-settings";
  private isLoadingFile = false;
  private debouncedFileChange: (file: RunnerFile) => void;

  constructor(
    container: HTMLElement,
    onFileChange?: (file: RunnerFile) => void,
    debounceDelay: number = 700
  ) {
    this.container = container;
    this.onFileChange = onFileChange;
    this.debouncedFileChange = debounce((file: RunnerFile) => {
      this.onFileChange?.(file);
    }, debounceDelay);
    this.initializeEditor();
  }

  private initializeEditor(): void {
    if (this.view) {
      this.view.destroy();
    }

    // Determine which theme to use
    const theme = this.getEffectiveTheme();

    this.view = new EditorView({
      parent: this.container,
      doc: this.currentFile?.content || "",
      extensions: [
        basicSetup,
        javascript({ jsx: true, typescript: true }),
        theme === "dark" ? vscodeDark : vscodeLight,
        EditorView.updateListener.of((update) => {
          if (
            update.docChanged &&
            this.currentFile &&
            this.onFileChange &&
            !this.isLoadingFile
          ) {
            this.currentFile.content = update.state.doc.toString();
            this.debouncedFileChange(this.currentFile);
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
            fontSize: "12px",
          },
        }),
      ],
    });
  }

  private getEffectiveTheme(): "light" | "dark" {
    if (this.currentTheme === "light") {
      return "light";
    } else if (this.currentTheme === "dark") {
      return "dark";
    } else {
      // device-settings: check system preference
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  }

  loadFile(file: RunnerFile): void {
    this.currentFile = file;
    this.isLoadingFile = true;

    if (this.view) {
      this.view.dispatch({
        changes: {
          from: 0,
          to: this.view.state.doc.length,
          insert: file.content,
        },
      });
    }

    this.isLoadingFile = false;
  }

  getCurrentFile(): RunnerFile | null {
    return this.currentFile;
  }

  updateContent(content: string): void {
    this.isLoadingFile = true;

    if (this.view) {
      this.view.dispatch({
        changes: {
          from: 0,
          to: this.view.state.doc.length,
          insert: content,
        },
      });
    }

    this.isLoadingFile = false;
  }

  setTheme(theme: "light" | "dark" | "device-settings"): void {
    this.currentTheme = theme;
    // Re-initialize the editor with the new theme
    const currentContent = this.view?.state.doc.toString() || "";
    this.initializeEditor();
    if (currentContent && this.view) {
      this.isLoadingFile = true; // Prevent triggering onFileChange when just selecting a file
      this.view.dispatch({
        changes: {
          from: 0,
          to: this.view.state.doc.length,
          insert: currentContent,
        },
      });
      this.isLoadingFile = false;
    }
  }

  destroy(): void {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }
}
