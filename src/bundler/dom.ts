export type ParentMessage =
  | { type: "iframe-ready" }
  | {
      type: "files-ack";
      payload: {
        fileCount: number;
        success: boolean;
        warnings?: readonly string[];
        error?: string;
      };
    };

let rootEl = document.getElementById("root");
let currentStyleElements: HTMLStyleElement[] = [];

export const postToParent = (message: ParentMessage): void => {
  window.parent.postMessage(message, "*");
};

export const resetRoot = (): void => {
  if (!(rootEl instanceof HTMLElement)) {
    return;
  }
  const fresh = rootEl.cloneNode(false) as HTMLElement;
  rootEl.replaceWith(fresh);
  rootEl = fresh;
};

export const applyCss = (cssChunks: readonly string[] | undefined): void => {
  if (currentStyleElements.length) {
    for (const styleEl of currentStyleElements) {
      styleEl.remove();
    }
    currentStyleElements = [];
  }

  if (!cssChunks?.length) {
    return;
  }

  for (const cssText of cssChunks) {
    if (!cssText.trim()) {
      continue;
    }
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);
    currentStyleElements.push(styleEl);
  }
};
