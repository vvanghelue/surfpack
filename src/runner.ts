export interface RunnerFile {
  path: string;
  content: string;
}

export type InitOptions = {
  bundlerUrl?: string;
  container: HTMLElement;
  files: RunnerFile[];
  entry?: string;
  debugMode?: boolean;
  onBundleComplete?: (result: {
    fileCount: number;
    warnings?: string[];
  }) => void;
  onBundleError?: (error: string) => void;
  onIframeReady?: () => void;
};

type BundlerMessage =
  | { type: "iframe-ready" }
  | {
      type: "files-ack";
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

  const postMessage = (message: FilesUpdateMessage) => {
    if (iframe?.contentWindow && isIframeReady) {
      iframe.contentWindow.postMessage(message, "*");
    }
  };

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
        if (options.onIframeReady) {
          options.onIframeReady();
        }
        // Send pending files if any
        if (pendingFiles) {
          sendFiles(pendingFiles, options.entry);
          pendingFiles = null;
        }
        break;

      case "files-ack":
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

  // Set up message listener
  window.addEventListener("message", handleMessage);

  // Create and setup iframe
  iframe = createIframe();
  options.container.appendChild(iframe);
  iframe.src = options.bundlerUrl || "dev-bundler.html";

  // Send initial files once iframe is ready
  if (options.files.length > 0) {
    sendFiles(options.files, options.entry);
  }

  return {
    destroy() {
      window.removeEventListener("message", handleMessage);
      if (iframe && options.container.contains(iframe)) {
        options.container.removeChild(iframe);
      }
      iframe = null;
      isIframeReady = false;
      pendingFiles = null;
    },

    updateFiles(files: RunnerFile[], entry?: string) {
      sendFiles(files, entry || options.entry);
    },

    updateFile(file: RunnerFile) {
      // Find and replace the file, or add it if it doesn't exist
      const currentFiles = pendingFiles || options.files;
      const fileIndex = currentFiles.findIndex((f) => f.path === file.path);

      let updatedFiles: RunnerFile[];
      if (fileIndex >= 0) {
        updatedFiles = [...currentFiles];
        updatedFiles[fileIndex] = file;
      } else {
        updatedFiles = [...currentFiles, file];
      }

      sendFiles(updatedFiles, options.entry);
    },

    get isReady() {
      return isIframeReady;
    },
  };
}
