import { getReactTemplateFiles } from "./code-templates/react-template.js";
import { getReactRuntimeErrorTemplateFiles } from "./code-templates/react-runtime-error.js";
import { init, type RunnerFile } from "../index.js";

// Available templates
const templates = {
  "react-template": getReactTemplateFiles,
  "react-runtime-error": getReactRuntimeErrorTemplateFiles,
};

let { files, entryFile } = getReactTemplateFiles();

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

// Populate the select with available templates
Object.keys(templates).forEach((key) => {
  const option = document.createElement("option");
  option.value = key;
  const template = templates[key as keyof typeof templates]();
  option.textContent = template.templateName;
  templateSelect.appendChild(option);
});

templateSelectorContainer.appendChild(templateLabel);
templateSelectorContainer.appendChild(templateSelect);
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
let runner = init({
  bundlerUrl: "./dev-bundler.html",
  container: uiContainer,
  files: files as RunnerFile[],
  entryFile: entryFile,
  debugMode: true,
  ui: {
    width: "100%",
    height: 800,
    showCodeEditor: true,
    showFileBrowser: true,
    showNavigator: true,
  },
  onBundleComplete: (result) => {
    console.log("Bundle completed:", result);
  },
  onBundleError: (error) => {
    console.error("Bundle error:", error);
  },
  onIframeReady: () => {
    console.log("Iframe is ready");
  },
});

// Function to switch templates
function switchTemplate(templateKey: string) {
  const templateFn = templates[templateKey as keyof typeof templates];
  if (!templateFn) return;

  const template = templateFn();
  files = template.files;
  entryFile = template.entryFile;

  // Update runner with new files
  runner.updateFiles(files as RunnerFile[], entryFile);
}

// Add event listener to template selector
templateSelect.addEventListener("change", (e) => {
  const target = e.target as HTMLSelectElement;
  switchTemplate(target.value);
});

console.log("UI Demo initialized successfully");
