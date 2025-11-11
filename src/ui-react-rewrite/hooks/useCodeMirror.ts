import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Compartment } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import type { RunnerFile } from "../../index.js";

export type UseCodeMirrorOptions = {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  file: RunnerFile | null;
  theme: "light" | "dark" | "device-settings";
  debounceDelay: number;
  onChange?: (file: RunnerFile) => void;
};

function resolveTheme(theme: "light" | "dark" | "device-settings") {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

function getThemeExtension(theme: "light" | "dark") {
  return theme === "dark" ? vscodeDark : vscodeLight;
}

export function useCodeMirror({
  containerRef,
  file,
  theme,
  debounceDelay,
  onChange,
}: UseCodeMirrorOptions) {
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef(new Compartment());
  const currentFileRef = useRef<RunnerFile | null>(null);
  const isLoadingRef = useRef(false);
  const changeTimeoutRef = useRef<number | null>(null);
  const scheduleChangeRef = useRef<(file: RunnerFile) => void>(() => {});

  useEffect(() => {
    scheduleChangeRef.current = (updatedFile: RunnerFile) => {
      if (!onChange) {
        return;
      }

      if (changeTimeoutRef.current !== null) {
        window.clearTimeout(changeTimeoutRef.current);
      }

      changeTimeoutRef.current = window.setTimeout(() => {
        changeTimeoutRef.current = null;
        onChange(updatedFile);
      }, debounceDelay);
    };
  }, [onChange, debounceDelay]);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current !== null) {
        window.clearTimeout(changeTimeoutRef.current);
        changeTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewRef.current) {
      return;
    }

    const initialTheme = resolveTheme(theme);

    const view = new EditorView({
      parent: container,
      doc: file?.content ?? "",
      extensions: [
        basicSetup,
        javascript({ jsx: true, typescript: true }),
        keymap.of([indentWithTab]),
        themeCompartmentRef.current.of(getThemeExtension(initialTheme)),
        EditorView.updateListener.of((update) => {
          if (
            !update.docChanged ||
            isLoadingRef.current ||
            !currentFileRef.current
          ) {
            return;
          }

          const nextContent = update.state.doc.toString();
          if (nextContent === currentFileRef.current.content) {
            return;
          }

          const updatedFile: RunnerFile = {
            ...currentFileRef.current,
            content: nextContent,
          };

          currentFileRef.current = updatedFile;
          scheduleChangeRef.current(updatedFile);
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-editor": { height: "100%" },
          ".cm-scroller": {
            fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
            fontSize: "12px",
          },
        }),
      ],
    });

    viewRef.current = view;
    currentFileRef.current = file ?? null;

    return () => {
      view.destroy();
      viewRef.current = null;
      currentFileRef.current = null;
    };
  }, [containerRef, file, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const nextTheme = resolveTheme(theme);
    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        getThemeExtension(nextTheme)
      ),
    });
  }, [theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    if (!file) {
      currentFileRef.current = null;
      isLoadingRef.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: "",
        },
      });
      isLoadingRef.current = false;
      return;
    }

    const currentDoc = view.state.doc.toString();
    const nextDoc = file.content ?? "";
    const sameFile = currentFileRef.current?.path === file.path;

    currentFileRef.current = file;

    if (sameFile && currentDoc === nextDoc) {
      return;
    }

    isLoadingRef.current = true;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: nextDoc,
      },
    });
    isLoadingRef.current = false;
  }, [file]);
}
