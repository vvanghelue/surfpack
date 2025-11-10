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

const handleRuntimeError = (value: unknown, origin?: string): void => {
  console.error(value);
  const { message, stack } = normalizeError(value);
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
      handleRuntimeError(error, "error");
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
