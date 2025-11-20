const OVERLAY_ID = "surfpack-error-overlay";

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const ensureOverlay = (): HTMLDivElement => {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing instanceof HTMLDivElement) {
    return existing;
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("role", "alert");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.background = "rgba(0, 0, 0, 0.9)";
  overlay.style.color = "#f8f8f2";
  overlay.style.padding = "32px";
  overlay.style.overflowY = "auto";
  overlay.style.fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
  overlay.style.boxSizing = "border-box";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.gap = "18px";

  document.body.appendChild(overlay);
  return overlay;
};

export const renderErrorOverlay = (
  title: string,
  message: string,
  stack: string,
  codePreviewHtml?: string
): void => {
  const overlay = ensureOverlay();
  overlay.innerHTML = "";

  const heading = document.createElement("div");
  heading.textContent = title;
  heading.style.fontSize = "20px";
  heading.style.fontWeight = "700";
  heading.style.color = "#ff5555";

  const summary = document.createElement("div");
  summary.innerHTML = escapeHtml(message);
  summary.style.fontSize = "16px";
  summary.style.whiteSpace = "pre-wrap";

  overlay.appendChild(heading);
  overlay.appendChild(summary);

  // Add code preview if available
  if (codePreviewHtml) {
    const previewContainer = document.createElement("div");
    previewContainer.innerHTML = codePreviewHtml;
    previewContainer.style.marginTop = "16px";
    previewContainer.style.marginBottom = "16px";
    overlay.appendChild(previewContainer);
  }

  const stackBlock = document.createElement("pre");
  stackBlock.innerHTML = escapeHtml(stack);
  stackBlock.style.margin = "0";
  stackBlock.style.padding = "20px";
  stackBlock.style.borderRadius = "12px";
  stackBlock.style.background = "rgba(40, 40, 40, 0.8)";
  stackBlock.style.fontSize = "14px";
  stackBlock.style.lineHeight = "1.5";
  stackBlock.style.whiteSpace = "pre-wrap";
  stackBlock.style.wordBreak = "break-word";

  overlay.appendChild(stackBlock);
};

export const clearErrorOverlay = (): void => {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
};
