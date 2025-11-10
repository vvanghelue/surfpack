import type { Loader } from "esbuild";

export const normalizePath = (path: string | null | undefined): string => {
  if (typeof path !== "string") {
    return "";
  }
  return path.replace(/^\.\//, "").replace(/^\/+/, "");
};

export const resolveRelativePath = (
  importer: string | undefined,
  specifier: string
): string => {
  const base = importer ? normalizePath(importer) : "";
  const baseUrl = new URL(base || ".", "https://app.local/");
  const resolved = new URL(specifier, baseUrl);
  return resolved.pathname.replace(/^\/+/, "");
};

export const dirname = (path: string): string => {
  const normalized = normalizePath(path);
  const parts = normalized.split("/");
  parts.pop();
  return parts.join("/");
};

export const loaderForPath = (path: string): Loader => {
  const normalized = normalizePath(path);
  const base = normalized.split("/").pop() ?? "";
  if (!base.includes(".")) return "tsx";
  if (normalized.endsWith(".tsx")) return "tsx";
  if (normalized.endsWith(".ts")) return "ts";
  if (normalized.endsWith(".jsx")) return "jsx";
  if (normalized.endsWith(".json")) return "json";
  if (normalized.endsWith(".css")) return "css";
  if (normalized.endsWith(".txt")) return "text";
  return "js";
};

export const resolveToExistingPath = (
  path: string | null,
  files: Map<string, string>
): string | null => {
  const extensionFallbacks = [
    ".tsx",
    ".ts",
    ".jsx",
    ".js",
    ".json",
    ".css",
  ] as const;
  if (!path) {
    return null;
  }
  if (files.has(path)) {
    return path;
  }
  for (const ext of extensionFallbacks) {
    const withExt = `${path}${ext}`;
    if (files.has(withExt)) {
      return withExt;
    }
  }
  if (!path.endsWith("/")) {
    for (const ext of extensionFallbacks) {
      const indexPath = `${path}/index${ext}`;
      if (files.has(indexPath)) {
        return indexPath;
      }
    }
  }
  return null;
};
