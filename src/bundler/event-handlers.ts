import { postToParent } from "./dom.js";
import { buildBundle, runBundle, type RunnerSourceFile } from "./bundle.js";
import { renderOverlay, clearErrorOverlay } from "./error-overlay.js";

type FilesUpdateRawPayload = {
  files?: unknown;
  entry?: unknown;
};

type FilesUpdateMessage = {
  type: "files-update";
  payload?: FilesUpdateRawPayload;
};

const isRunnerSourceFile = (value: unknown): value is RunnerSourceFile => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<RunnerSourceFile>;
  return typeof candidate.path === "string";
};

const sanitizeFiles = (value: unknown): RunnerSourceFile[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRunnerSourceFile).map((file) => ({
    path: file.path,
    content: typeof file.content === "string" ? file.content : undefined,
  }));
};

const isFilesUpdateMessage = (data: unknown): data is FilesUpdateMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return (data as { type?: unknown }).type === "files-update";
};

let buildCounter = 0;

const handleFilesUpdate = async (
  rawPayload: FilesUpdateRawPayload | undefined
): Promise<void> => {
  const files = sanitizeFiles(rawPayload?.files);
  const entry =
    typeof rawPayload?.entry === "string" ? rawPayload.entry : files[0]?.path;
  const token = ++buildCounter;

  if (!entry) {
    const error = "No entry file provided.";
    console.error(`Build failed:\n${error}`);
    renderOverlay("Build Error", error, "");
    postToParent({
      type: "files-ack",
      payload: { fileCount: files.length, success: false, error },
    });
    return;
  }

  try {
    console.error("Building preview...");
    const { code, css, warnings } = await buildBundle(files, entry);
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
    const warningText = warnings.length
      ? `\nWarnings:\n${warnings.join("\n")}`
      : "";
    console.error(`Rendered ${entry || "entry"} successfully.${warningText}`);
    postToParent({
      type: "files-ack",
      payload: { fileCount: files.length, success: true, warnings },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack || "" : "";
    console.error(`Build failed:\n${message}`);
    console.error(error);

    renderOverlay("Compilation Error", message, stack);

    if (token === buildCounter) {
      postToParent({
        type: "files-ack",
        payload: { fileCount: files.length, success: false, error: message },
      });
    }
  }
};

export const registerParentMessageListener = (): void => {
  window.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (event.source !== window.parent) {
      return;
    }
    if (!isFilesUpdateMessage(event.data)) {
      return;
    }
    void handleFilesUpdate(event.data.payload);
  });
};
