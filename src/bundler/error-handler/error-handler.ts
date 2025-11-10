// Re-export functions from separated modules for backward compatibility
export { clearErrorOverlay } from "./error-overlay.js";
export {
  installGlobalErrorHandler,
  showErrorOverlay,
} from "./global-error-handler.js";
