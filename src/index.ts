import {
  MessageFilesUpdate,
  MessageFromIframe,
  MessageToIframe,
  MessageLoadRoute,
} from "./iframe-runner/iframe-messaging.js";
import { createUi } from "./ui/ui.js";
import { createUiReact } from "./ui-react-rewrite/index.js";
import type { UiOptions, UiComponent } from "./ui/ui.js";

export * from "./iframe-runner/iframe-runner.js";
export * from "./standalone-runner/standalone-runner.js";
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
  onAppUrlChange?: (newUrl: string) => void; // when the app URL changes in the bundler iframe
  ui?: UiOptions;
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
  let currentEntryFile: string | undefined = options.entryFile;
  let pendingRoute: string | null = null; // Store route for refresh

  // Define sendFiles function first
  const postMessage = (message: MessageToIframe) => {
    if (iframe?.contentWindow && isIframeReady) {
      iframe.contentWindow.postMessage(message, "*");
    }
  };

  const sendFiles = (
    files: RunnerFile[],
    entry?: string,
    initialRoute?: string
  ) => {
    if (!isIframeReady) {
      pendingFiles = files;
      return;
    }

    const message: MessageFilesUpdate = {
      type: "files-update",
      payload: {
        files: files,
        entry: entry,
        initialRoute: initialRoute,
      },
    };

    if (options.debugMode) {
      console.log("[Runner] Sending files:", message);
    }

    postMessage(message);
  };

  const navigateToRoute = (route: string) => {
    if (!isIframeReady) {
      console.warn("[Runner] Cannot navigate: iframe not ready");
      return;
    }

    const message: MessageLoadRoute = {
      type: "routing-history-load-route",
      payload: {
        routeToGoTo: route,
      },
    };

    if (options.debugMode) {
      console.log("[Runner] Navigating to route:", route);
    }

    postMessage(message);
  };

  // Create UI if ui options are provided
  let ui: UiComponent | null = null;
  let iframeContainer: HTMLElement;

  if (options.ui) {
    const implementation = options.ui.implementation ?? "legacy";
    const uiFactory = implementation === "react" ? createUiReact : createUi;

    ui = uiFactory(options.container, options.ui, (updatedFile) => {
      // Handle file changes from the code editor
      const fileIndex = currentFiles.findIndex(
        (f) => f.path === updatedFile.path
      );
      if (fileIndex >= 0) {
        currentFiles[fileIndex] = updatedFile;
        sendFiles(currentFiles, currentEntryFile, "/");
      }
    });

    // Set up the initial files in the UI
    if (ui.fileBrowser) {
      ui.fileBrowser.setFiles(currentFiles);
      // Select the entry file by default
      if (currentEntryFile) {
        const entryFile = currentFiles.find((f) => f.path === currentEntryFile);
        if (entryFile && ui.codeEditor) {
          ui.codeEditor.loadFile(entryFile);
          ui.fileBrowser.selectFile(currentEntryFile);
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
        if (iframe && iframeContainer.contains(iframe)) {
          // Store current route from navigator input for restoration after reload
          pendingRoute = ui!.navigator!.getCurrentRoute();

          // Remove old iframe
          iframeContainer.removeChild(iframe);

          // Create new iframe and reload bundler
          iframe = createIframe();
          iframeContainer.appendChild(iframe);

          const defaultBundlerUrl =
            location.hostname === "localhost"
              ? "dev-bundler.html"
              : "https://vvanghelue.github.io/surfpack/online/online-bundler.html";
          iframe.src = options.bundlerUrl || defaultBundlerUrl;
          isIframeReady = false;
        }
      });

      // Connect navigator to route navigation
      ui.navigator.onNavigate((route) => {
        navigateToRoute(route);
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

    const data = event.data as MessageFromIframe;

    if (options.debugMode) {
      console.log("[Runner] Received message:", data);
    }

    switch (data.type) {
      case "iframe-ready":
        isIframeReady = true;
        // Don't set URL from iframe src - routing is virtual and starts with "/"
        if (ui?.navigator) {
          if (pendingRoute) {
            // Restore route after refresh
            ui.navigator.setUrl(pendingRoute);
          } else {
            ui.navigator.setUrl("/");
          }
        }
        if (options.onIframeReady) {
          options.onIframeReady();
        }
        // Send pending files if any
        if (pendingFiles) {
          sendFiles(pendingFiles, currentEntryFile, pendingRoute || "/");
          pendingFiles = null;
        } else {
          sendFiles(currentFiles, currentEntryFile, pendingRoute || "/");
        }

        // Clear pending route since it's been sent with files
        pendingRoute = null;
        break;

      case "build-result-ack":
        if (data.payload.success) {
          if (options.onBundleComplete) {
            options.onBundleComplete({
              fileCount: data.payload.fileCount,
            });
          }
        } else {
          if (options.onBundleError && data.payload.error) {
            options.onBundleError(data.payload.error);
          }
        }
        break;

      case "routing-history-state-changed":
        if (ui?.navigator) {
          ui.navigator.setUrl(data.payload.newRoute);
        }
        if (options.onAppUrlChange) {
          options.onAppUrlChange(data.payload.newRoute);
        }
        break;
    }
  };

  // Set up message listener
  window.addEventListener("message", handleMessage);

  const attachIframeToContainer = (target: HTMLElement) => {
    if (!iframe) return;
    if (iframe.parentElement !== target) {
      target.appendChild(iframe);
    }
    iframeContainer = target;
  };

  const resolvePreferredContainer = () => {
    if (!ui) {
      return options.container;
    }

    const candidate = ui.previewContainer;
    return candidate ?? options.container;
  };

  const isReactPreviewContainerReady = (element: HTMLElement) => {
    return element.classList?.contains("surfpack-iframe-bundler-iframe");
  };

  const mountIframeWithRetry = (attempt = 0) => {
    const target = resolvePreferredContainer();
    const shouldAttach =
      !ui || isReactPreviewContainerReady(target) || attempt >= 10;

    if (shouldAttach) {
      attachIframeToContainer(target);
      return;
    }

    requestAnimationFrame(() => mountIframeWithRetry(attempt + 1));
  };

  // Create and setup iframe
  iframe = createIframe();
  mountIframeWithRetry();
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
      currentEntryFile = entry;
      if (ui?.fileBrowser) {
        ui.fileBrowser.setFiles(currentFiles);

        // Update the code editor with the entry file or first file
        const entryFile = entry;
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
      sendFiles(currentFiles, entry, "/");
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

      sendFiles(currentFiles, currentEntryFile, "/");
    },

    get isReady() {
      return isIframeReady;
    },

    get ui() {
      return ui;
    },

    navigateToRoute(route: string) {
      navigateToRoute(route);
    },
  };
}
