// Import all demo templates
import { basicCounterReact } from "./basic-counter-react.js";
import { todoAppReact } from "./todo-app-react.js";
import { weatherAppReact } from "./weather-app-react.js";
import { vanillaJsTodoApp } from "./vanilla-js-todo.js";
import { calculatorApp } from "./calculator-app.js";

// Export all templates
export const demoTemplates = {
  "react-basic": basicCounterReact,
  "react-todo": todoAppReact,
  "react-weather": weatherAppReact,
  "vanilla-todo": vanillaJsTodoApp,
  calculator: calculatorApp,
};

// Export individual templates
export {
  basicCounterReact,
  todoAppReact,
  weatherAppReact,
  vanillaJsTodoApp,
  calculatorApp,
};

// Helper function to get template by key
export function getTemplate(key) {
  return demoTemplates[key];
}

// Get all template keys
export function getTemplateKeys() {
  return Object.keys(demoTemplates);
}

// Get template info for dropdown/selection
export function getTemplateOptions() {
  return Object.entries(demoTemplates).map(([key, template]) => ({
    value: key,
    label: template.templateName,
    description: template.description,
  }));
}
