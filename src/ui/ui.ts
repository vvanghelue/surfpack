import { CodeEditor } from "./code-editor.js";
import { FileBrowser } from "./file-browser.js";
import { Navigator } from "./navigator.js";
import { applyUiStyles } from "./ui.style.css.js";
import { applyCodeMirrorStyles } from "./codemirror.style.css.js";
import type { RunnerFile } from "../index.js";
import { setupHorizontalResizing } from "./panel-resizer/panel-resizer.js";

export type UiOptions = {
  theme?: "light" | "dark" | "device-settings";
  width?: number | string;
  height?: number | string;
  showCodeEditor?: boolean;
  showFileBrowser?: boolean;
  showNavigator?: boolean;
  codeEditorInitialWidth?: number;
  fileBrowserDefaultExpanded?: boolean;
  debounceDelay?: number; // Default: 700ms - delay for code editor changes
  // showDebugLogMessages?: boolean; // not implemented yet
};

export interface UiComponent {
  container: HTMLElement;
  fileBrowser?: FileBrowser;
  codeEditor?: CodeEditor;
  navigator?: Navigator;
  previewContainer: HTMLElement;
  setTheme(theme: "light" | "dark" | "device-settings"): void;
  toggleCodeEditor(show: boolean): void;
  toggleFileBrowser(show: boolean): void;
  toggleNavigator(show: boolean): void;
  destroy(): void;
}

function applyTheme(
  container: HTMLElement,
  theme: "light" | "dark" | "device-settings"
): void {
  container.classList.remove("dark-mode", "light-mode");
  if (theme === "dark") container.classList.add("dark-mode");
  else if (theme === "light") container.classList.add("light-mode");
}

export function createUi(
  container: HTMLElement,
  options: UiOptions = {},
  onFileChange?: (file: RunnerFile) => void
): UiComponent {
  const {
    theme = "device-settings",
    width = "100%",
    height = "100%",
    showCodeEditor = true,
    showFileBrowser = true,
    showNavigator = true,
    codeEditorInitialWidth = undefined,
    fileBrowserDefaultExpanded = true,
    debounceDelay = 700,
  } = options;

  // Apply styles
  applyUiStyles();
  applyCodeMirrorStyles();

  // main UI container
  const mainContainer = document.createElement("div");
  mainContainer.className = "surfpack-ui";
  mainContainer.style.width = `${width}px`;
  mainContainer.style.height = `${height}px`;

  applyTheme(mainContainer, theme);

  // File browser
  let fileBrowser: FileBrowser | undefined;
  let fileBrowserContainer: HTMLElement | undefined;
  if (showFileBrowser) {
    fileBrowserContainer = document.createElement("div");
    fileBrowserContainer.className = "surfpack-file-browser";
    mainContainer.appendChild(fileBrowserContainer);

    fileBrowser = new FileBrowser(fileBrowserContainer, {
      defaultExpanded: fileBrowserDefaultExpanded,
    });
  }

  // Code editor
  let codeEditor: CodeEditor | undefined;
  let codeEditorContainer: HTMLElement | undefined;
  if (showCodeEditor) {
    codeEditorContainer = document.createElement("div");
    codeEditorContainer.className = "surfpack-code-editor";
    if (codeEditorInitialWidth) {
      codeEditorContainer.style.width = `${codeEditorInitialWidth}px`;
    }
    mainContainer.appendChild(codeEditorContainer);

    codeEditor = new CodeEditor(
      codeEditorContainer,
      onFileChange,
      debounceDelay
    );
  }

  // Preview area, on the right (contains navigator and iframe)
  const previewArea = document.createElement("div");
  previewArea.className = "surfpack-iframe-bundler-container";

  // Navigator
  let navigator: Navigator | undefined;
  let navigatorContainer: HTMLElement | undefined;
  if (showNavigator) {
    navigatorContainer = document.createElement("div");
    navigatorContainer.className = "surfpack-iframe-bundler-navigator";
    previewArea.appendChild(navigatorContainer);

    navigator = new Navigator(navigatorContainer);
  }

  // Iframe container
  const iframeContainer = document.createElement("div");
  iframeContainer.className = "surfpack-iframe-bundler-iframe";
  previewArea.appendChild(iframeContainer);

  mainContainer.appendChild(previewArea);
  container.appendChild(mainContainer);

  // Connect file browser and code editor if both exist
  if (fileBrowser && codeEditor) {
    fileBrowser.onFileSelect = (file: RunnerFile) => {
      codeEditor!.loadFile(file);
    };
  }

  // Apply initial theme to code editor if it exists
  if (codeEditor) {
    codeEditor.setTheme(theme);
  }

  // Setup horizontal resizing (handles auto-created if not provided)
  const isVisible = (el?: HTMLElement) =>
    !!el && getComputedStyle(el).display !== "none";

  let cleanupResizer: () => void = () => {};
  const setupResizerForCurrent = () => {
    // Always tear down previous handles/listeners before re-initializing
    cleanupResizer();
    cleanupResizer = setupHorizontalResizing({
      mainContainer,
      previewArea,
      fileBrowserContainer: isVisible(fileBrowserContainer)
        ? fileBrowserContainer
        : undefined,
      codeEditorContainer: isVisible(codeEditorContainer)
        ? codeEditorContainer
        : undefined,
      handleWidth: 6,
      min: { fileBrowser: 150, editor: 200, preview: 200 },
    });
  };

  // Initial setup (respects initial visibility of panels)
  setupResizerForCurrent();

  return {
    container: mainContainer,
    fileBrowser,
    codeEditor,
    navigator,
    previewContainer: iframeContainer,
    setTheme(newTheme: "light" | "dark" | "device-settings") {
      applyTheme(mainContainer, newTheme);
      // Also update code editor theme
      if (codeEditor) {
        codeEditor.setTheme(newTheme);
      }
    },
    toggleCodeEditor(show: boolean) {
      if (codeEditorContainer) {
        codeEditorContainer.style.display = show ? "" : "none";
        // Recreate resizer to reflect new visible/hidden state
        setupResizerForCurrent();
      }
    },
    toggleFileBrowser(show: boolean) {
      if (fileBrowserContainer) {
        fileBrowserContainer.style.display = show ? "" : "none";
        // Recreate resizer to reflect new visible/hidden state
        setupResizerForCurrent();
      }
    },
    toggleNavigator(show: boolean) {
      if (navigatorContainer) {
        navigatorContainer.style.display = show ? "" : "none";
      }
    },
    destroy() {
      if (container.contains(mainContainer)) {
        container.removeChild(mainContainer);
      }
      fileBrowser?.destroy();
      codeEditor?.destroy();
      navigator?.destroy();
      cleanupResizer();
    },
  };
}
