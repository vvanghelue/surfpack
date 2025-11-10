import { applyCss, resetRoot } from "./dom.js";
import { clearErrorOverlay } from "./error-handler.js";
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

export interface RunnerSourceFile {
  path: string;
  content?: string;
}

export interface BundleOutput {
  code: string;
  css: string[];
  warnings: string[];
}

let currentModuleUrl: string | null = null;

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
  files: ReadonlyArray<RunnerSourceFile>,
  entry: string
): Promise<BundleOutput> => {
  const esbuild = await ensureEsbuild();
  const fileMap = new Map<string, string>();
  for (const file of files) {
    if (!file || typeof file.path !== "string") {
      continue;
    }
    fileMap.set(normalizePath(file.path), file.content ?? "");
  }

  const entryPath = normalizePath(entry);
  if (!entryPath || !fileMap.has(entryPath)) {
    throw new Error(`Entry file not found: ${entry}`);
  }

  const virtualFsPlugin = createVirtualFsPlugin(fileMap, entryPath);

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

  const warnings = result.warnings.length
    ? await esbuild.formatMessages(result.warnings, {
        kind: "warning",
        color: false,
      })
    : [];

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

  return { code: jsOutput, css: cssOutputs, warnings };
};

export const runBundle = async (
  bundleCode: string,
  cssChunks: readonly string[]
): Promise<void> => {
  clearErrorOverlay();
  applyCss(cssChunks);

  if (currentModuleUrl) {
    URL.revokeObjectURL(currentModuleUrl);
    currentModuleUrl = null;
  }

  resetRoot();
  const blob = new Blob([bundleCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  currentModuleUrl = url;
  ensureImportMap();
  await import(url);
};
