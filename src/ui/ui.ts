import { CodeEditor } from "./code-editor.js";
import { FileBrowser } from "./file-browser.js";
import { Navigator } from "./navigator.js";
import { applyUiStyles } from "./ui.style.css.js";
import type { RunnerFile } from "../index.js";

export type UiOptions = {
  theme?: "light" | "dark" | "device-settings";
  width?: number | string;
  height?: number | string;
  showCodeEditor?: boolean;
  showFileBrowser?: boolean;
  showNavigator?: boolean;
};

export interface UiComponent {
  container: HTMLElement;
  fileBrowser?: FileBrowser;
  codeEditor?: CodeEditor;
  navigator?: Navigator;
  previewContainer: HTMLElement;
  setTheme(theme: "light" | "dark" | "device-settings"): void;
  destroy(): void;
}

function applyTheme(
  container: HTMLElement,
  theme: "light" | "dark" | "device-settings"
): void {
  // Remove existing theme classes
  container.classList.remove("dark-mode", "light-mode");

  if (theme === "dark") {
    container.classList.add("dark-mode");
  } else if (theme === "light") {
    container.classList.add("light-mode");
  }
  // For "device-settings", we rely on CSS @media (prefers-color-scheme: dark)
  // so no class is needed
}

export function createUi(
  container: HTMLElement,
  options: UiOptions = {},
  onFileChange?: (file: RunnerFile) => void
): UiComponent {
  const {
    width = "100%",
    height = "100%",
    showCodeEditor = true,
    showFileBrowser = true,
    showNavigator = true,
    theme = "device-settings",
  } = options;

  // Apply styles
  applyUiStyles();

  // Create main UI container
  const mainContainer = document.createElement("div");
  mainContainer.className = "surfpack-ui";
  mainContainer.style.width = `${width}px`;
  mainContainer.style.height = `${height}px`;

  // Apply theme
  applyTheme(mainContainer, theme);

  // File browser
  let fileBrowser: FileBrowser | undefined;
  if (showFileBrowser) {
    const fileBrowserContainer = document.createElement("div");
    fileBrowserContainer.className = "surfpack-file-browser";
    mainContainer.appendChild(fileBrowserContainer);

    fileBrowser = new FileBrowser(fileBrowserContainer);
  }

  // Code editor
  let codeEditor: CodeEditor | undefined;
  if (showCodeEditor) {
    const codeEditorContainer = document.createElement("div");
    codeEditorContainer.className = "surfpack-code-editor";
    mainContainer.appendChild(codeEditorContainer);

    codeEditor = new CodeEditor(codeEditorContainer, onFileChange);
  }

  // Preview area
  const previewArea = document.createElement("div");
  previewArea.className = "surfpack-iframe-bundler-container";

  // Navigator
  let navigator: Navigator | undefined;
  if (showNavigator) {
    const navigatorContainer = document.createElement("div");
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
    destroy() {
      if (container.contains(mainContainer)) {
        container.removeChild(mainContainer);
      }
      fileBrowser?.destroy();
      codeEditor?.destroy();
      navigator?.destroy();
    },
  };
}
