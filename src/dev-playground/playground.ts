import { reactApp } from "./code-templates/react-template.js";
import { reactRuntimeErrorApp } from "./code-templates/react-runtime-error.js";
import { reactRouterApp } from "./code-templates/react-router-template.js";
import { vanillaJsTodoApp } from "./code-templates/vanilla-js-todo.js";
import { init, type RunnerFile } from "../index.js";

// Available templates
const templates = {
  "react-template": reactApp,
  "react-runtime-error": reactRuntimeErrorApp,
  "react-router": reactRouterApp,
  "vanilla-js-todo": vanillaJsTodoApp,
};

let { files, entryFile } = reactApp;

const rootEl = document.querySelector("#root") as HTMLElement;

if (!rootEl) {
  throw new Error("Root element not found");
}

rootEl.style.padding = "20px";

// Add template selector
const templateSelectorContainer = document.createElement("div");
templateSelectorContainer.style.marginBottom = "20px";
templateSelectorContainer.style.padding = "15px";
templateSelectorContainer.style.backgroundColor = "#f8f9fa";
templateSelectorContainer.style.borderRadius = "8px";
templateSelectorContainer.style.border = "1px solid #e9ecef";

const templateLabel = document.createElement("label");
templateLabel.textContent = "Select Template: ";
templateLabel.style.marginRight = "10px";
templateLabel.style.fontWeight = "600";
templateLabel.style.fontSize = "14px";

const templateSelect = document.createElement("select");
templateSelect.style.padding = "8px 12px";
templateSelect.style.borderRadius = "6px";
templateSelect.style.border = "1px solid #ced4da";
templateSelect.style.backgroundColor = "white";
templateSelect.style.fontSize = "14px";
templateSelect.style.marginRight = "20px";

// Populate the select with available templates
Object.keys(templates).forEach((key) => {
  const option = document.createElement("option");
  option.value = key;
  const template = templates[key as keyof typeof templates];
  option.textContent = template.templateName;
  templateSelect.appendChild(option);
});

// Add theme selector
const themeLabel = document.createElement("label");
themeLabel.textContent = "Theme: ";
themeLabel.style.marginRight = "10px";
themeLabel.style.fontWeight = "600";
themeLabel.style.fontSize = "14px";

const themeSelect = document.createElement("select");
themeSelect.style.padding = "8px 12px";
themeSelect.style.borderRadius = "6px";
themeSelect.style.border = "1px solid #ced4da";
themeSelect.style.backgroundColor = "white";
themeSelect.style.fontSize = "14px";

// Add theme options
const themeOptions = [
  { value: "device-settings", text: "Device Settings (Auto)" },
  { value: "light", text: "Light" },
  { value: "dark", text: "Dark" },
];

themeOptions.forEach(({ value, text }) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  if (value === "dark") option.selected = true; // Match the initial theme
  themeSelect.appendChild(option);
});

templateSelectorContainer.appendChild(templateLabel);
templateSelectorContainer.appendChild(templateSelect);
templateSelectorContainer.appendChild(themeLabel);
templateSelectorContainer.appendChild(themeSelect);
rootEl.appendChild(templateSelectorContainer);

// Create container for the UI
const uiContainer = document.createElement("div");
// uiContainer.style.width = "100%";
// uiContainer.style.height = "800px";
// uiContainer.style.border = "1px solid #e9ecef";
// uiContainer.style.borderRadius = "8px";
// uiContainer.style.overflow = "hidden";
// uiContainer.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
rootEl.appendChild(uiContainer);

// Initialize the runner with UI
let surfpack = init({
  bundlerUrl: "./playground-bundler.html",
  container: uiContainer,
  files: files as RunnerFile[],
  entryFile: entryFile,
  debugMode: true,
  ui: {
    theme: "dark",
    width: "100%",
    height: 800,
    showCodeEditor: true,
    showFileBrowser: true,
    showNavigator: true,
  },
  onBundleComplete: (result: { fileCount: number; warnings?: string[] }) => {
    console.log("Bundle completed:", result);
  },
  onBundleError: (error: string) => {
    console.error("Bundle error:", error);
  },
  onIframeReady: () => {
    console.log("Iframe is ready");
  },
});

// Function to switch templates
function switchTemplate(templateKey: string) {
  const template = templates[templateKey as keyof typeof templates];
  if (!template) return;

  files = template.files;
  entryFile = template.entryFile;

  // Update runner with new files
  surfpack.updateFiles(files as RunnerFile[], entryFile);
}

// Function to switch theme
function switchTheme(theme: "light" | "dark" | "device-settings") {
  if (surfpack.ui) {
    surfpack.ui.setTheme(theme);
  }
}

// Add event listener to template selector
templateSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  switchTemplate(target.value);
});

// Add event listener to theme selector
themeSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  switchTheme(target.value as "light" | "dark" | "device-settings");
});

console.log("UI Demo initialized successfully");
