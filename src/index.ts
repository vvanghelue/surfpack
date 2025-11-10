import { UiOptions, createUi } from "./ui/ui.js";

export * from "./bundler/iframe-runner.js";
export * from "./bundler/standalone-runner.js";
export * from "./ui/ui.js";

export interface RunnerFile {
  path: string;
  content: string;
}

export type InitOptions = {
  bundlerUrl?: string;
  container: HTMLElement;
  files: RunnerFile[];
  entryFile?: string;
  debugMode?: boolean;
  showErrorOverlay?:
    | "all-errors"
    | "compilation-errors"
    | "runtime-errors"
    | "none"; // the red overlay that is shown
  onBundleComplete?: (result: {
    fileCount: number;
    warnings?: string[];
  }) => void;
  onBundleError?: (error: string) => void;
  onIframeReady?: () => void;
  onAppUrlChange?: () => void; // when the app URL changes in the bundler iframe
  ui?: UiOptions;
};

type BundlerMessage =
  | { type: "iframe-ready" }
  | {
      type: "build-result-ack";
      payload: {
        fileCount: number;
        success: boolean;
        warnings?: readonly string[];
        error?: string;
      };
    };

type FilesUpdateMessage = {
  type: "files-update";
  payload: {
    files: RunnerFile[];
    entry?: string;
  };
};

function createIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  return iframe;
}

export function init(options: InitOptions) {
  let iframe: HTMLIFrameElement | null = null;
  let isIframeReady = false;
  let pendingFiles: RunnerFile[] | null = null;
  let currentFiles: RunnerFile[] = [...options.files];

  // Define sendFiles function first
  const postMessage = (message: FilesUpdateMessage) => {
    if (iframe?.contentWindow && isIframeReady) {
      iframe.contentWindow.postMessage(message, "*");
    }
  };

  const sendFiles = (files: RunnerFile[], entry?: string) => {
    if (!isIframeReady) {
      pendingFiles = files;
      return;
    }

    const message: FilesUpdateMessage = {
      type: "files-update",
      payload: {
        files: files,
        entry: entry,
      },
    };

    if (options.debugMode) {
      console.log("[Runner] Sending files:", message);
    }

    postMessage(message);
  };

  // Create UI if ui options are provided
  let ui: ReturnType<typeof createUi> | null = null;
  let iframeContainer: HTMLElement;

  if (options.ui) {
    ui = createUi(options.container, options.ui, (updatedFile) => {
      // Handle file changes from the code editor
      const fileIndex = currentFiles.findIndex(
        (f) => f.path === updatedFile.path
      );
      if (fileIndex >= 0) {
        currentFiles[fileIndex] = updatedFile;
        sendFiles(currentFiles, options.entryFile);
      }
    });

    // Set up the initial files in the UI
    if (ui.fileBrowser) {
      ui.fileBrowser.setFiles(currentFiles);
      // Select the entry file by default
      if (options.entryFile) {
        const entryFile = currentFiles.find(
          (f) => f.path === options.entryFile
        );
        if (entryFile && ui.codeEditor) {
          ui.codeEditor.loadFile(entryFile);
          ui.fileBrowser.selectFile(options.entryFile);
        }
      } else if (currentFiles.length > 0 && ui.codeEditor) {
        ui.codeEditor.loadFile(currentFiles[0]);
        ui.fileBrowser.selectFile(currentFiles[0].path);
      }
    }

    iframeContainer = ui.previewContainer;

    // Set up navigator if available
    if (ui.navigator) {
      ui.navigator.setUrl("Loading...");
      ui.navigator.onRefresh(() => {
        if (iframe?.contentWindow) {
          iframe.contentWindow.location.reload();
        }
      });
    }
  } else {
    iframeContainer = options.container;
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    // Ensure message is from our iframe
    if (!iframe || event.source !== iframe.contentWindow) {
      return;
    }

    const data = event.data as BundlerMessage;

    if (options.debugMode) {
      console.log("[Runner] Received message:", data);
    }

    switch (data.type) {
      case "iframe-ready":
        isIframeReady = true;
        if (ui?.navigator) {
          ui.navigator.setUrl(iframe?.src || "");
        }
        if (options.onIframeReady) {
          options.onIframeReady();
        }
        // Send pending files if any
        if (pendingFiles) {
          sendFiles(pendingFiles, options.entryFile);
          pendingFiles = null;
        } else {
          sendFiles(currentFiles, options.entryFile);
        }
        break;

      case "build-result-ack":
        if (data.payload.success) {
          if (options.onBundleComplete) {
            options.onBundleComplete({
              fileCount: data.payload.fileCount,
              warnings: data.payload.warnings
                ? [...data.payload.warnings]
                : undefined,
            });
          }
        } else {
          if (options.onBundleError && data.payload.error) {
            options.onBundleError(data.payload.error);
          }
        }
        break;
    }
  };

  // Set up message listener
  window.addEventListener("message", handleMessage);

  // Create and setup iframe
  iframe = createIframe();
  iframeContainer.appendChild(iframe);
  iframe.src = options.bundlerUrl || "dev-bundler.html";

  return {
    destroy() {
      window.removeEventListener("message", handleMessage);
      if (iframe && iframeContainer.contains(iframe)) {
        iframeContainer.removeChild(iframe);
      }
      if (ui) {
        ui.destroy();
      }
      iframe = null;
      isIframeReady = false;
      pendingFiles = null;
    },

    updateFiles(files: RunnerFile[], entry?: string) {
      currentFiles = [...files];
      if (ui?.fileBrowser) {
        ui.fileBrowser.setFiles(currentFiles);

        // Update the code editor with the entry file or first file
        const entryFile = entry || options.entryFile;
        if (entryFile && ui.codeEditor) {
          const fileToLoad = currentFiles.find((f) => f.path === entryFile);
          if (fileToLoad) {
            ui.codeEditor.loadFile(fileToLoad);
            ui.fileBrowser.selectFile(entryFile);
          }
        } else if (currentFiles.length > 0 && ui.codeEditor) {
          // Fallback to first file if no entry file specified
          ui.codeEditor.loadFile(currentFiles[0]);
          ui.fileBrowser.selectFile(currentFiles[0].path);
        }
      }
      sendFiles(currentFiles, entry || options.entryFile);
    },

    updateFile(file: RunnerFile) {
      // Find and replace the file, or add it if it doesn't exist
      const fileIndex = currentFiles.findIndex((f) => f.path === file.path);

      if (fileIndex >= 0) {
        currentFiles[fileIndex] = file;
      } else {
        currentFiles.push(file);
      }

      if (ui?.fileBrowser) {
        ui.fileBrowser.setFiles(currentFiles);
      }

      sendFiles(currentFiles, options.entryFile);
    },

    get isReady() {
      return isIframeReady;
    },

    get ui() {
      return ui;
    },
  };
}
