import { CompilationError } from "../bundle.js";
import { renderOverlay } from "./error-overlay.js";

const OVERLAY_TITLE = "Runtime Error";

interface NormalizedError {
  message: string;
  stack: string;
}

declare global {
  interface Window {
    __surfpackErrorHandlerInstalled?: boolean;
  }
}

const normalizeError = (value: unknown): NormalizedError => {
  if (value instanceof Error) {
    return {
      message: value.message || "Unknown error",
      stack: value.stack || value.message || "(no stack trace)",
    };
  }

  try {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return {
      message: text || "Unknown error",
      stack: text || "(no stack trace)",
    };
  } catch {
    return { message: "Unknown error", stack: "(no stack trace)" };
  }
};

const isNetworkOrResourceError = (
  error: unknown,
  event?: ErrorEvent
): boolean => {
  // Check if it's a resource loading error (images, CSS, fonts, etc.)
  if (event?.target && event.target !== window) {
    const target = event.target as Element;
    const tagName = target.tagName?.toLowerCase();
    if (
      ["img", "link", "script", "video", "audio", "source", "iframe"].includes(
        tagName
      )
    ) {
      return true;
    }
  }

  // Check error message patterns for network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const networkErrorPatterns = [
      "network error",
      "failed to fetch",
      "load failed",
      "loading css chunk",
      "loading chunk",
      "connection refused",
      "timeout",
      "network request failed",
      "fetch error",
      "cors error",
      "resource not found",
      "404",
      "503",
      "failed to load resource",
    ];

    return networkErrorPatterns.some((pattern) => message.includes(pattern));
  }

  return false;
};

const handleRuntimeError = (
  value: unknown,
  origin?: string,
  event?: ErrorEvent
): void => {
  // Filter out network/resource loading errors
  if (isNetworkOrResourceError(value, event)) {
    console.warn("Network/Resource error (ignored by error overlay):", value);
    return;
  }

  console.error(value);
  const { message, stack } = normalizeError(value);
  if (value instanceof CompilationError) {
    const title = origin
      ? `Compilation Error (${origin})`
      : "Compilation Error";
    renderOverlay(title, message, stack);
    return;
  }
  const title = origin ? `${OVERLAY_TITLE} (${origin})` : OVERLAY_TITLE;
  renderOverlay(title, message, stack);
};

export const installGlobalErrorHandler = (): void => {
  if (window.__surfpackErrorHandlerInstalled) {
    return;
  }
  window.__surfpackErrorHandlerInstalled = true;

  window.addEventListener(
    "error",
    (event: ErrorEvent) => {
      if (!event) {
        return;
      }
      event.preventDefault();
      const error = event.error || new Error(event.message || "Unknown error");
      handleRuntimeError(error, "error", event);
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      if (!event) {
        return;
      }
      event.preventDefault();
      handleRuntimeError(event.reason, "unhandledrejection");
    },
    true
  );
};

export const showErrorOverlay = (error: unknown): void => {
  handleRuntimeError(error);
};
