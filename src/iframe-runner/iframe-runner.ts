import { registerParentMessageListener } from "./event-handlers.js";
import { installGlobalErrorHandler } from "../bundler/error-handler/error-handler.js";
import { postToParent } from "./iframe-messaging.js";

export function iframeRunner() {
  installGlobalErrorHandler();
  registerParentMessageListener();
  postToParent({ type: "iframe-ready" });
}
