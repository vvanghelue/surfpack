import { applyResizerStyles } from "./panel-resizer.style.css";

applyResizerStyles();

export type PanelResizerOptions = {
  mainContainer: HTMLElement;
  previewArea: HTMLElement;
  fileBrowserContainer?: HTMLElement;
  codeEditorContainer?: HTMLElement;
  handleBetweenFBAndEditor?: HTMLElement; // between file browser and editor
  handleBetweenLeftAndPreview?: HTMLElement; // between left panels and preview
  handleWidth?: number; // default 6
  min?: { fileBrowser?: number; editor?: number; preview?: number };
};

/**
 * Sets up horizontal resizing between the three main panels.
 * - Left handle resizes the file browser (if both FB and editor exist)
 * - Right handle resizes the code editor (if present)
 * The preview remains flex and fills the remaining space.
 * Returns a cleanup function that removes listeners.
 */
export function setupHorizontalResizing(opts: PanelResizerOptions): () => void {
  const {
    mainContainer,
    previewArea,
    fileBrowserContainer,
    codeEditorContainer,
    handleBetweenFBAndEditor: providedLeftHandle,
    handleBetweenLeftAndPreview: providedRightHandle,
    handleWidth = 6,
  } = opts;

  const MIN_FB = opts.min?.fileBrowser ?? 150;
  const MIN_EDITOR = opts.min?.editor ?? 200;
  const MIN_PREVIEW = opts.min?.preview ?? 200;

  // Pin initial widths so preview flexes to fill the remainder
  //   if (fileBrowserContainer) {
  //     const fbW = fileBrowserContainer.offsetWidth || 250;
  //     fileBrowserContainer.style.width = `${fbW}px`;
  //     fileBrowserContainer.style.flex = "0 0 auto";
  //   }
  //   if (codeEditorContainer) {
  //     const edW = codeEditorContainer.offsetWidth || 600;
  //     codeEditorContainer.style.width = `${edW}px`;
  //     codeEditorContainer.style.flex = "0 0 auto";
  //   }
  //   previewArea.style.flex = "1 1 auto";
  //   previewArea.style.width = "";

  // Create handles if not provided
  let handleBetweenFBAndEditor = providedLeftHandle;
  let handleBetweenLeftAndPreview = providedRightHandle;
  const createdHandles: HTMLElement[] = [];
  const makeHandle = () => {
    const el = document.createElement("div");
    el.className = "surfpack-resize-handle";
    return el;
  };
  // Insert left handle between FB and editor if both present and handle missing
  if (
    !handleBetweenFBAndEditor &&
    fileBrowserContainer &&
    codeEditorContainer
  ) {
    handleBetweenFBAndEditor = makeHandle();
    fileBrowserContainer.insertAdjacentElement(
      "afterend",
      handleBetweenFBAndEditor
    );
    createdHandles.push(handleBetweenFBAndEditor);
  }
  // Insert right handle between left (editor if present else FB) and preview if missing
  if (
    !handleBetweenLeftAndPreview &&
    previewArea &&
    (codeEditorContainer || fileBrowserContainer)
  ) {
    handleBetweenLeftAndPreview = makeHandle();
    const leftMost = codeEditorContainer ?? fileBrowserContainer!;
    leftMost.insertAdjacentElement("afterend", handleBetweenLeftAndPreview);
    createdHandles.push(handleBetweenLeftAndPreview);
  }

  type ActiveHandleType = "fb" | "editor" | null;
  let isResizing = false;
  let activeHandle: ActiveHandleType = null;
  let startX = 0;
  let startWidth = 0;
  let rafPending = false;

  function totalWidth(): number {
    return mainContainer.getBoundingClientRect().width;
  }

  function beginDrag(type: ActiveHandleType, e: MouseEvent, width: number) {
    isResizing = true;
    activeHandle = type;
    startX = e.clientX;
    startWidth = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    // Avoid iframe stealing mouseup
    (previewArea as HTMLElement).style.pointerEvents = "none";
  }

  function endDrag() {
    isResizing = false;
    activeHandle = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    (previewArea as HTMLElement).style.pointerEvents = "";
  }

  function applyResize(deltaX: number) {
    const total = totalWidth();
    const handlesCount = [
      handleBetweenFBAndEditor,
      handleBetweenLeftAndPreview,
    ].filter(Boolean).length;
    const handlesTotal = handlesCount * handleWidth;
    const fbCurrent = fileBrowserContainer
      ? fileBrowserContainer.offsetWidth
      : 0;

    if (activeHandle === "fb" && fileBrowserContainer && codeEditorContainer) {
      const editorFixed = codeEditorContainer.offsetWidth;
      let newFB = startWidth + deltaX;
      const maxFB = total - editorFixed - MIN_PREVIEW - handlesTotal;
      newFB = Math.max(MIN_FB, Math.min(maxFB, newFB));
      fileBrowserContainer.style.width = `${Math.round(newFB)}px`;
      fileBrowserContainer.style.flex = "0 0 auto";
      codeEditorContainer.style.width = `${Math.round(editorFixed)}px`;
      codeEditorContainer.style.flex = "0 0 auto";
      previewArea.style.flex = "1 1 auto";
      previewArea.style.width = "";
    } else if (activeHandle === "editor" && codeEditorContainer) {
      const fbFixed = fileBrowserContainer ? fbCurrent : 0;
      let newEditor = startWidth + deltaX;
      const maxEditor = total - fbFixed - MIN_PREVIEW - handlesTotal;
      newEditor = Math.max(MIN_EDITOR, Math.min(maxEditor, newEditor));
      if (fileBrowserContainer) {
        fileBrowserContainer.style.width = `${Math.round(fbFixed)}px`;
        fileBrowserContainer.style.flex = "0 0 auto";
      }
      codeEditorContainer.style.width = `${Math.round(newEditor)}px`;
      codeEditorContainer.style.flex = "0 0 auto";
      previewArea.style.flex = "1 1 auto";
      previewArea.style.width = "";
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!isResizing || !activeHandle) return;
    const dx = e.clientX - startX;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        applyResize(dx);
        rafPending = false;
      });
    }
  }

  function onMouseUp() {
    if (!isResizing) return;
    endDrag();
  }

  function onMouseDownLeft(e: MouseEvent) {
    if (!fileBrowserContainer || !codeEditorContainer) return;
    beginDrag("fb", e, fileBrowserContainer.offsetWidth);
  }

  function onMouseDownRight(e: MouseEvent) {
    if (!codeEditorContainer) return;
    beginDrag("editor", e, codeEditorContainer.offsetWidth);
  }

  // Wire up
  if (handleBetweenFBAndEditor) {
    handleBetweenFBAndEditor.addEventListener("mousedown", onMouseDownLeft);
  }
  if (handleBetweenLeftAndPreview) {
    handleBetweenLeftAndPreview.addEventListener("mousedown", onMouseDownRight);
  }
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // Return cleanup
  return () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    handleBetweenFBAndEditor?.removeEventListener("mousedown", onMouseDownLeft);
    handleBetweenLeftAndPreview?.removeEventListener(
      "mousedown",
      onMouseDownRight
    );
    // Remove created handles from DOM
    for (const h of createdHandles) {
      if (h.parentElement) h.parentElement.removeChild(h);
    }
  };
}
