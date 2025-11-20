import { registerParentMessageListener } from "./event-handlers.js";
import { postToParent } from "./iframe-messaging.js";

export function iframeRunner() {
  registerParentMessageListener();
  postToParent({ type: "iframe-ready" });
}
