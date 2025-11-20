import { ensureEsbuild, type Esbuild } from "./esbuild.js";
import { ensureImportMap } from "./import-map.js";
import {
  normalizePath,
  resolveRelativePath,
  dirname,
  loaderForPath,
  resolveToExistingPath,
} from "./path-utils.js";
import type { Plugin } from "esbuild";
import { RunnerSourceFile } from "./source-file.js";
import { packageJsonExtractMainEntry } from "./extract-package-json.js";
import { ensureIndexHtml } from "./ensure-index-html.js";
import {
  extractCssLoadedInHtml,
  extractFileEntryFromHtml,
} from "./extract-html.js";
import { clearErrorOverlay } from "./error-handler/error-overlay/error-overlay.js";

declare global {
  interface Window {
    __surfpackBundledCode?: string;
    __surfpackSourceFiles?: ReadonlyArray<RunnerSourceFile>;
  }
}

export interface BundleOutput {
  code: string;
  css: string[];
}
export class CompilationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompilationError";
  }
}

// no need to remove this singleton, multiple instance create multiple iframes
// and standalone mode is singleton by principle
let currentModuleUrl: string | null = null;
// let rootEl = document.getElementById("root");
let currentStyleElements: HTMLStyleElement[] = [];

// const resetRoot = (): void => {
//   if (!(rootEl instanceof HTMLElement)) {
//     return;
//   }
//   const fresh = rootEl.cloneNode(false) as HTMLElement;
//   rootEl.replaceWith(fresh);
//   rootEl = fresh;
// };

export const applyCss = (cssChunks: readonly string[] | undefined): void => {
  if (currentStyleElements.length) {
    for (const styleEl of currentStyleElements) {
      styleEl.remove();
    }
    currentStyleElements = [];
  }

  if (!cssChunks?.length) {
    return;
  }

  for (const cssText of cssChunks) {
    if (!cssText.trim()) {
      continue;
    }
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);
    currentStyleElements.push(styleEl);
  }
};

const createVirtualFsPlugin = (
  fileMap: Map<string, string>,
  entryPath: string
): Plugin => ({
  name: "virtual-fs",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.kind === "entry-point") {
        return { path: entryPath, namespace: "virtual" };
      }

      if (args.namespace === "virtual") {
        if (args.path.startsWith(".") || args.path.startsWith("/")) {
          const resolved = resolveRelativePath(args.importer, args.path);
          const target = resolveToExistingPath(resolved, fileMap);
          if (target) {
            return { path: target, namespace: "virtual" };
          }
        } else {
          const direct = normalizePath(args.path);
          const target = resolveToExistingPath(direct, fileMap);
          if (target) {
            return { path: target, namespace: "virtual" };
          }
        }
      }

      if (args.path.startsWith(".") || args.path.startsWith("/")) {
        const importer = args.importer;
        const resolved = resolveRelativePath(importer, args.path);
        const target = resolveToExistingPath(resolved, fileMap);
        if (target) {
          return { path: target, namespace: "virtual" };
        }
      }

      return { path: args.path, external: true };
    });

    build.onLoad({ filter: /.*/, namespace: "virtual" }, (args) => {
      if (!fileMap.has(args.path)) {
        return null;
      }
      const contents = fileMap.get(args.path) ?? "";
      const loader = loaderForPath(args.path);
      const dir = dirname(args.path);
      return {
        contents,
        loader,
        resolveDir: dir ? `/${dir}` : "/",
      };
    });
  },
});

export const buildBundle = async (
  files: RunnerSourceFile[],
  entry?: string
): Promise<BundleOutput> => {
  const esbuild = await ensureEsbuild();
  const fileMap = new Map<string, string>();
  for (const file of files) {
    if (!file || typeof file.path !== "string") {
      continue;
    }
    fileMap.set(normalizePath(file.path), file.content);
  }

  if (entry && entry.endsWith(".html")) {
    throw new Error(".html files are not supported as entry files");
  }

  if (!entry) {
    if (fileMap.has("package.json")) {
      entry =
        packageJsonExtractMainEntry(fileMap.get("package.json") || "") ||
        undefined;
    }
    if (!entry && fileMap.has("index.html")) {
      // some heuristics on the presence of a <script/> with a src attribute matching a file
      entry = extractFileEntryFromHtml(fileMap.get("index.html") || "", files);
    }
  }

  const entryPath = normalizePath(entry);
  if (!entryPath || !fileMap.has(entryPath)) {
    throw new Error(
      `You should provide a valid entry file via entryFile parameter or a package.json with a valid main field, example : src/index.tsx`
    );
  }

  const virtualFsPlugin = createVirtualFsPlugin(fileMap, entryPath);

  try {
    const result = await esbuild.build({
      entryPoints: [entryPath],
      write: false,
      bundle: true,
      format: "esm",
      platform: "browser",
      target: ["es2022"],
      jsx: "automatic",
      jsxImportSource: "react",
      sourcemap: "inline",
      logLevel: "silent",
      outdir: "/",
      assetNames: "[name]",
      plugins: [virtualFsPlugin],
    });

    const outputFiles = result.outputFiles ?? [];
    const cssOutputs: string[] = [];
    let jsOutput = "";

    for (const file of outputFiles) {
      if (file.path.endsWith(".css")) {
        cssOutputs.push(file.text);
        continue;
      }
      if (!jsOutput) {
        jsOutput = file.text;
      }
    }

    // extract css present in index.html and put it in cssOutputs
    if (fileMap.has("index.html")) {
      const htmlContent = fileMap.get("index.html") || "";
      const { linkedFiles, inlineStyles } = extractCssLoadedInHtml(
        htmlContent,
        files
      );

      cssOutputs.push(...inlineStyles);

      for (const linkedFile of linkedFiles) {
        const cssContent = fileMap.get(linkedFile);
        if (cssContent) {
          cssOutputs.push(cssContent);
        }
      }
    }

    return { code: jsOutput, css: cssOutputs };
  } catch (error) {
    throw new CompilationError(error?.toString() || "");
  }
};

export const runBundle = async (
  bundleCode: string,
  cssChunks: readonly string[],
  files: ReadonlyArray<RunnerSourceFile>
): Promise<void> => {
  clearErrorOverlay();

  // Store bundled code and source files globally for error handler
  window.__surfpackBundledCode = bundleCode;
  window.__surfpackSourceFiles = files;

  // more heuristics for practicality
  document.body.innerHTML = `
    <div id="root"></div>
    <div id="app"></div>
  `;

  const indexHtmlFile = files.find((file) => file.path === "index.html");
  if (indexHtmlFile) {
    ensureIndexHtml(document, indexHtmlFile.content ?? "");
  }

  applyCss(cssChunks);

  if (currentModuleUrl) {
    URL.revokeObjectURL(currentModuleUrl);
    currentModuleUrl = null;
  }

  // @TODO what to do about it ? necessseary ?
  // resetRoot();

  const blob = new Blob([bundleCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  currentModuleUrl = url;
  ensureImportMap(files);

  await import(url);
};
