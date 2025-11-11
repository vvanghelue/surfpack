import { buildBundle, runBundle } from "../bundler/bundle.js";
import {
  renderOverlay,
  clearErrorOverlay,
} from "../bundler/error-handler/error-overlay.js";
import { sanitizeFiles } from "../bundler/source-file.js";
import {
  MessageFilesUpdate,
  MessageToIframe,
  postToParent,
} from "./iframe-messaging.js";

const isFilesUpdateMessage = (data: unknown) => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return (data as { type?: unknown }).type === "files-update";
};

let buildCounter = 0;

const handleFilesUpdate = async (
  rawPayload: MessageFilesUpdate["payload"]
): Promise<void> => {
  const files = sanitizeFiles(rawPayload?.files);

  // if (typeof rawPayload?.entry !== "string") {
  //   throw new Error(
  //     'You should provide a string as "entry" in the files update message.'
  //   );
  // }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack || "" : "";
    console.error(`Build failed:\n${message}`);
    console.error(error);

    renderOverlay("Compilation Error", message, stack);

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
    if (!isFilesUpdateMessage(event.data)) {
      return;
    }
    if (event.data.type === "files-update") {
      handleFilesUpdate(event.data.payload);
    }
  });
};
