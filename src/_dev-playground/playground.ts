import { reactApp } from "./code-templates/react-template.js";
import { reactRuntimeErrorApp } from "./code-templates/react-runtime-error.js";
import { reactRouterApp } from "./code-templates/react-router-template.js";
import { vanillaJsTodoApp } from "./code-templates/vanilla-js-todo.js";
import { init, type RunnerFile } from "../index.js";

type Template = {
  templateName: string;
  description: string;
  files: { path: string; content: string }[];
  entryFile?: string | undefined;
};

// Available templates
const templates: Record<string, Template> = {
  "react-router": reactRouterApp,
  "react-template": reactApp,
  "react-runtime-error": reactRuntimeErrorApp,
  "vanilla-js-todo": vanillaJsTodoApp,
};

let {
  files,
  entryFile,
}: {
  files: { path: string; content: string }[];
  entryFile?: string;
} = reactRouterApp;

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
templateSelectorContainer.style.display = "flex";
templateSelectorContainer.style.justifyContent = "space-between";
templateSelectorContainer.style.alignItems = "center";

// Left side container for template and theme selectors
const leftControlsContainer = document.createElement("div");
leftControlsContainer.style.display = "flex";
leftControlsContainer.style.alignItems = "center";
leftControlsContainer.style.gap = "20px";

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

// Template selector group
const templateGroup = document.createElement("div");
templateGroup.style.display = "flex";
templateGroup.style.alignItems = "center";
templateGroup.appendChild(templateLabel);
templateGroup.appendChild(templateSelect);

// Theme selector group
const themeGroup = document.createElement("div");
themeGroup.style.display = "flex";
themeGroup.style.alignItems = "center";
themeGroup.appendChild(themeLabel);
themeGroup.appendChild(themeSelect);

leftControlsContainer.appendChild(templateGroup);
leftControlsContainer.appendChild(themeGroup);

// Add UI controls container (right side)
const uiControlsContainer = document.createElement("div");
uiControlsContainer.style.display = "flex";
uiControlsContainer.style.gap = "15px";
uiControlsContainer.style.alignItems = "center";

// UI controls label
const uiControlsLabel = document.createElement("span");
uiControlsLabel.textContent = "UI Controls: ";
uiControlsLabel.style.fontWeight = "600";
uiControlsLabel.style.fontSize = "14px";

uiControlsContainer.appendChild(uiControlsLabel);

// Create checkboxes for UI components
const uiOptions = [
  { key: "showCodeEditor", label: "Code Editor", initial: true },
  { key: "showFileBrowser", label: "File Browser", initial: true },
  { key: "showNavigator", label: "Navigator", initial: true },
];

const checkboxes: Record<string, HTMLInputElement> = {};

uiOptions.forEach(({ key, label, initial }) => {
  const checkboxContainer = document.createElement("label");
  checkboxContainer.style.display = "flex";
  checkboxContainer.style.alignItems = "center";
  checkboxContainer.style.gap = "5px";
  checkboxContainer.style.fontSize = "14px";
  checkboxContainer.style.cursor = "pointer";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = initial;
  checkbox.style.cursor = "pointer";

  const labelText = document.createElement("span");
  labelText.textContent = label;

  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(labelText);
  uiControlsContainer.appendChild(checkboxContainer);

  checkboxes[key] = checkbox;
});

templateSelectorContainer.appendChild(leftControlsContainer);
templateSelectorContainer.appendChild(uiControlsContainer);
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

let surfpack = init({
  bundlerUrl: "./playground-iframe.html",
  container: uiContainer,
  files: files as RunnerFile[],
  entryFile: entryFile,
  activeFilePath: entryFile,

  theme: themeSelect.value as "light" | "dark" | "device-settings",
  width: "100%",
  height: 800,
  showCodeEditor: checkboxes.showCodeEditor.checked,
  showFileBrowser: checkboxes.showFileBrowser.checked,
  showNavigator: checkboxes.showNavigator.checked,

  showErrorOverlay: true,
  onError: (error) => {
    console.log("Surfpack reported an error:", error);
  },
});

// Function to switch templates
function switchTemplate(templateKey: string) {
  const template = templates[templateKey];
  if (!template) return;

  files = template.files;
  entryFile = template.entryFile;

  // Update runner with new files
  surfpack.updateFiles(files as RunnerFile[], entryFile);
}

// Function to switch theme
function switchTheme(theme: "light" | "dark" | "device-settings") {
  if (surfpack) {
    surfpack.setTheme(theme);
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

// Add event listeners for UI component checkboxes
Object.entries(checkboxes).forEach(([key, checkbox]) => {
  checkbox.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    toggleUIComponent(
      key as "showCodeEditor" | "showFileBrowser" | "showNavigator",
      target.checked
    );
  });
});

// Function to toggle UI components
function toggleUIComponent(
  component: "showCodeEditor" | "showFileBrowser" | "showNavigator",
  show: boolean
) {
  if (!surfpack) return;

  switch (component) {
    case "showCodeEditor":
      surfpack.toggleCodeEditor(show);
      break;
    case "showFileBrowser":
      surfpack.toggleFileBrowser(show);
      break;
    case "showNavigator":
      surfpack.toggleNavigator(show);
      break;
  }
}

console.log("UI Demo initialized successfully");
