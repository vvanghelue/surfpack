import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  PointerEventHandler,
} from "react";
import { applyResizerStyles } from "../../ui/panel-resizer/panel-resizer.style.css.js";

type UseHorizontalResizersOptions = {
  mainRef: MutableRefObject<HTMLDivElement | null>;
  previewRef: MutableRefObject<HTMLDivElement | null>;
  fileBrowserRef: MutableRefObject<HTMLDivElement | null>;
  codeEditorRef: MutableRefObject<HTMLDivElement | null>;
  fileBrowserVisible: boolean;
  codeEditorVisible: boolean;
  handleWidth?: number;
  minFileBrowser?: number;
  minEditor?: number;
  minPreview?: number;
};

type ActiveHandleType = "fileBrowser" | "codeEditor" | "leftOnly" | null;

type DragContext = {
  type: Exclude<ActiveHandleType, null>;
  startX: number;
  startFileBrowserWidth: number;
  startCodeEditorWidth: number;
  pointerId: number;
  originHandle: HTMLDivElement;
};

function isVisible(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false;
  return element.style.display !== "none";
}

function clamp(value: number, min: number, max: number): number {
  const high = Math.max(min, max);
  return Math.max(min, Math.min(high, value));
}

type HandleBindings = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export function useHorizontalResizers(options: UseHorizontalResizersOptions): {
  leftHandleProps: HandleBindings;
  rightHandleProps: HandleBindings;
} {
  const {
    mainRef,
    previewRef,
    fileBrowserRef,
    codeEditorRef,
    fileBrowserVisible,
    codeEditorVisible,
    handleWidth = 6,
    minFileBrowser = 150,
    minEditor = 200,
    minPreview = 200,
  } = options;

  useEffect(() => {
    applyResizerStyles();
  }, []);

  const dragContextRef = useRef<DragContext | null>(null);
  const rafPendingRef = useRef(false);

  const totalWidth = useCallback(() => {
    const main = mainRef.current;
    return main ? main.getBoundingClientRect().width : 0;
  }, [mainRef]);

  const handlesWidthTotal = useCallback(() => {
    const fileBrowser = fileBrowserRef.current;
    const codeEditor = codeEditorRef.current;
    const fileBrowserActive = fileBrowserVisible && isVisible(fileBrowser);
    const codeEditorActive = codeEditorVisible && isVisible(codeEditor);
    let count = 0;
    if (fileBrowserActive && codeEditorActive) {
      count += 1;
    }
    if (codeEditorActive || fileBrowserActive) {
      count += 1;
    }
    return count * handleWidth;
  }, [
    codeEditorRef,
    fileBrowserRef,
    codeEditorVisible,
    fileBrowserVisible,
    handleWidth,
  ]);

  const resetUiState = useCallback(() => {
    const previewArea = previewRef.current;
    const context = dragContextRef.current;
    dragContextRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (previewArea) {
      previewArea.style.pointerEvents = "";
    }
    if (context?.originHandle) {
      context.originHandle.classList.remove("active");
      try {
        context.originHandle.releasePointerCapture(context.pointerId);
      } catch (error) {
        // Ignore release errors if capture was already lost.
      }
    }
  }, [previewRef]);

  useEffect(() => {
    return () => {
      if (dragContextRef.current) {
        resetUiState();
      }
    };
  }, [resetUiState]);

  const applyResize = useCallback(
    (deltaX: number) => {
      const context = dragContextRef.current;
      const previewArea = previewRef.current;
      const fileBrowser = fileBrowserRef.current;
      const codeEditor = codeEditorRef.current;

      if (!context || !previewArea) {
        return;
      }

      const total = totalWidth();
      const handlesTotal = handlesWidthTotal();
      const { type, startFileBrowserWidth, startCodeEditorWidth } = context;

      if (type === "fileBrowser" && fileBrowser && codeEditor) {
        const max = total - startCodeEditorWidth - minPreview - handlesTotal;
        const nextWidth = clamp(
          startFileBrowserWidth + deltaX,
          minFileBrowser,
          max
        );
        fileBrowser.style.width = `${Math.round(nextWidth)}px`;
        fileBrowser.style.flex = "0 0 auto";
        codeEditor.style.width = `${Math.round(startCodeEditorWidth)}px`;
        codeEditor.style.flex = "0 0 auto";
        previewArea.style.flex = "1 1 auto";
        previewArea.style.width = "";
        return;
      }

      if (type === "codeEditor" && codeEditor) {
        const fileBrowser = fileBrowserRef.current;
        const fileBrowserActive = fileBrowserVisible && isVisible(fileBrowser);
        const base = fileBrowserActive ? startFileBrowserWidth : 0;
        const max = total - base - minPreview - handlesTotal;
        const nextWidth = clamp(startCodeEditorWidth + deltaX, minEditor, max);
        if (fileBrowser && fileBrowserActive) {
          fileBrowser.style.width = `${Math.round(startFileBrowserWidth)}px`;
          fileBrowser.style.flex = "0 0 auto";
        }
        codeEditor.style.width = `${Math.round(nextWidth)}px`;
        codeEditor.style.flex = "0 0 auto";
        previewArea.style.flex = "1 1 auto";
        previewArea.style.width = "";
        return;
      }

      if (type === "leftOnly" && fileBrowser) {
        const max = total - minPreview - handlesTotal;
        const nextWidth = clamp(
          startFileBrowserWidth + deltaX,
          minFileBrowser,
          max
        );
        fileBrowser.style.width = `${Math.round(nextWidth)}px`;
        fileBrowser.style.flex = "0 0 auto";
        previewArea.style.flex = "1 1 auto";
        previewArea.style.width = "";
      }
    },
    [
      codeEditorRef,
      fileBrowserRef,
      handlesWidthTotal,
      minEditor,
      minFileBrowser,
      minPreview,
      previewRef,
      totalWidth,
      fileBrowserVisible,
    ]
  );

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const context = dragContextRef.current;
      if (!context || context.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - context.startX;
      if (rafPendingRef.current) {
        return;
      }

      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        applyResize(deltaX);
        rafPendingRef.current = false;
      });
    },
    [applyResize]
  );

  const finishDrag = useCallback(() => {
    if (!dragContextRef.current) {
      return;
    }
    resetUiState();
  }, [resetUiState]);

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const context = dragContextRef.current;
      if (!context || context.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      finishDrag();
    },
    [finishDrag]
  );

  const handlePointerCancel: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const context = dragContextRef.current;
      if (!context || context.pointerId !== event.pointerId) {
        return;
      }
      finishDrag();
    },
    [finishDrag]
  );

  const beginDrag = useCallback(
    (
      type: Exclude<ActiveHandleType, null>,
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      const previewArea = previewRef.current;
      if (!previewArea) {
        return;
      }

      const fileBrowser = fileBrowserRef.current;
      const codeEditor = codeEditorRef.current;

      dragContextRef.current = {
        type,
        pointerId: event.pointerId,
        startX: event.clientX,
        startFileBrowserWidth: fileBrowser?.offsetWidth ?? 0,
        startCodeEditorWidth: codeEditor?.offsetWidth ?? 0,
        originHandle: event.currentTarget,
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      previewArea.style.pointerEvents = "none";
      event.currentTarget.classList.add("active");
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [codeEditorRef, fileBrowserRef, previewRef]
  );

  const handleLeftPointerDown: PointerEventHandler<HTMLDivElement> =
    useCallback(
      (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") {
          return;
        }

        const fileBrowser = fileBrowserRef.current;
        const codeEditor = codeEditorRef.current;

        const fileBrowserActive = fileBrowserVisible && isVisible(fileBrowser);
        const codeEditorActive = codeEditorVisible && isVisible(codeEditor);

        if (!fileBrowserActive || !codeEditorActive) {
          return;
        }

        event.preventDefault();
        beginDrag("fileBrowser", event);
      },
      [
        beginDrag,
        codeEditorRef,
        fileBrowserRef,
        codeEditorVisible,
        fileBrowserVisible,
      ]
    );

  const handleRightPointerDown: PointerEventHandler<HTMLDivElement> =
    useCallback(
      (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") {
          return;
        }

        const fileBrowser = fileBrowserRef.current;
        const codeEditor = codeEditorRef.current;

        const fileBrowserActive = fileBrowserVisible && isVisible(fileBrowser);
        const codeEditorActive = codeEditorVisible && isVisible(codeEditor);

        if (!codeEditorActive && !fileBrowserActive) {
          return;
        }

        event.preventDefault();
        if (codeEditorActive) {
          beginDrag("codeEditor", event);
        } else if (fileBrowserActive) {
          beginDrag("leftOnly", event);
        }
      },
      [
        beginDrag,
        codeEditorRef,
        fileBrowserRef,
        codeEditorVisible,
        fileBrowserVisible,
      ]
    );

  const leftHandleProps = useMemo<HandleBindings>(
    () => ({
      onPointerDown: handleLeftPointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    }),
    [
      handleLeftPointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
    ]
  );

  const rightHandleProps = useMemo<HandleBindings>(
    () => ({
      onPointerDown: handleRightPointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    }),
    [
      handleRightPointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
    ]
  );

  return { leftHandleProps, rightHandleProps };
}
