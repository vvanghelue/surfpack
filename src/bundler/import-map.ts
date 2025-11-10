import type { RunnerSourceFile } from "./bundle.js";
import { extractDependencies } from "./extract-package-json.js";

const generateImportMapFromDependencies = (
  dependencies: Record<string, string>
): Record<string, string> => {
  const imports: Record<string, string> = {};

  for (const [packageName, version] of Object.entries(dependencies)) {
    // Clean version string (remove ^ ~ etc.)
    const cleanVersion = version.replace(/^[\^~]/, "");
    imports[packageName] = `https://esm.sh/${packageName}@${cleanVersion}`;

    // Add React JSX runtime imports when React is found
    if (packageName === "react") {
      imports["react/jsx-runtime"] =
        `https://esm.sh/react@${cleanVersion}/jsx-runtime`;
      imports["react/jsx-dev-runtime"] =
        `https://esm.sh/react@${cleanVersion}/jsx-dev-runtime`;
    }

    // Add React DOM client imports when react-dom is found
    if (packageName === "react-dom") {
      imports["react-dom/client"] =
        `https://esm.sh/react-dom@${cleanVersion}/client`;
    }

    // @ TODO
    // Add Vue.js runtime imports when Vue is found
    // if (packageName === "vue") {
    //   imports["vue/dist/vue.esm-bundler.js"] =
    //     `https://esm.sh/vue@${cleanVersion}/dist/vue.esm-bundler.js`;
    //   imports["@vue/runtime-dom"] =
    //     `https://esm.sh/@vue/runtime-dom@${cleanVersion}`;
    //   imports["@vue/runtime-core"] =
    //     `https://esm.sh/@vue/runtime-core@${cleanVersion}`;
    // }
  }

  return imports;
};

export const ensureImportMap = (() => {
  let applied = false;
  let currentImports: Record<string, string> = {};

  return (files?: ReadonlyArray<RunnerSourceFile>): void => {
    let imports: Record<string, string> = {};

    if (files) {
      // Look for package.json files and parse their dependencies
      for (const file of files) {
        if (
          file.path === "package.json" ||
          file.path.endsWith("/package.json")
        ) {
          const dependencies = extractDependencies(file.content || "");
          if (dependencies) {
            imports = generateImportMapFromDependencies(dependencies);
            break;
          }
        }
      }
    }

    // Check if imports have changed
    const importsChanged =
      JSON.stringify(currentImports) !== JSON.stringify(imports);

    if (applied && !importsChanged) {
      return;
    }

    // Remove previous import map if it exists and imports changed
    if (applied && importsChanged) {
      const existingScript = document.querySelector('script[type="importmap"]');
      if (existingScript) {
        existingScript.remove();
      }
    }

    const script = document.createElement("script");
    script.type = "importmap";
    script.textContent = JSON.stringify({ imports });
    document.head.appendChild(script);

    currentImports = imports;
    applied = true;
  };
})();
