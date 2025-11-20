import { buildBundle, runBundle } from "../bundler/bundle.js";
import {
  clearErrorOverlay,
  renderErrorOverlay,
} from "../bundler/error-handler/error-overlay.js";
import { installGlobalErrorHandler } from "../bundler/error-handler/global-error-handler.js";
import { sanitizeFiles } from "../bundler/source-file.js";
import {
  MessageErrorOverlaySetup,
  MessageFilesUpdate,
  MessageLoadRoute,
  MessageToIframe,
  postToParent,
} from "./iframe-messaging.js";
import {
  applyRouteChangeFromParent,
  initializeRoutingState,
} from "./routing-history-state.js";

let buildCounter = 0;

const handleFilesUpdate = async (
  rawPayload: MessageFilesUpdate["payload"]
): Promise<void> => {
  const files = sanitizeFiles(rawPayload?.files);

  const entry = rawPayload?.entry;
  const token = ++buildCounter;

  // if (!entry) {
  //   const error = "No entry file provided.";
  //   console.error(`Build failed:\n${error}`);
  //   renderOverlay("Build Error", error, "");
  //   postToParent({
  //     type: "build-result-ack",
  //     payload: { fileCount: files.length, success: false, error },
  //   });
  //   return;
  // }

  try {
    console.log("Building preview...");
    const { code, css } = await buildBundle(files, entry);
    if (token !== buildCounter) {
      return;
    }

    if (!code.trim()) {
      throw new Error("Bundle is empty. Check your entry file exports.");
    }

    await runBundle(code, css, files);
    if (token !== buildCounter) {
      return;
    }

    clearErrorOverlay();
    postToParent({
      type: "build-result-ack",
      payload: { fileCount: files.length, success: true },
    });
    initializeRoutingState(rawPayload.initialRouteState);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack || "" : "";
    console.error(`Build failed:\n${message}`);
    console.error(error);

    renderErrorOverlay("Compilation Error", message, stack);

    if (token === buildCounter) {
      postToParent({
        type: "build-result-ack",
        payload: { fileCount: files.length, success: false, error: message },
      });
    }
  }
};

export const registerParentMessageListener = (): void => {
  window.addEventListener("message", (event: MessageEvent<MessageToIframe>) => {
    if (event.source !== window.parent) {
      return;
    }

    if (event.data.type === "files-update") {
      handleFilesUpdate(event.data.payload);
    }

    if (event.data.type === "routing-history-load-route") {
      applyRouteChangeFromParent(event.data as MessageLoadRoute);
    }

    if (event.data.type === "error-overlay-setup") {
      const { payload } = event.data as MessageErrorOverlaySetup;
      if (payload.errorOverlayErrors) {
        installGlobalErrorHandler();
      }

      // @TODO
      // (event.data as MessageErrorOverlaySetup);
    }
  });
};
