import { RunnerFile } from "..";

// find any <script> in head or body that matches src attribute to a file path
// return the first matching path found
// use DOMParser
export function extractFileEntryFromHtml(
  htmlContent: string,
  files: RunnerFile[]
): string | undefined {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Get all script tags with src attributes
  const scriptTags = doc.querySelectorAll("script[src]");

  // Create a set of available file paths for quick lookup
  const availableFiles = new Set(files.map((file) => file.path));

  // Check each script tag's src attribute
  for (const script of scriptTags) {
    const src = script.getAttribute("src");
    if (!src) continue;

    // Check if the src path matches any available file directly
    if (availableFiles.has(src)) {
      return src;
    }

    // Also check with normalized paths (remove leading ./ if present)
    const normalizedSrc = src.startsWith("./") ? src.slice(2) : src;
    if (availableFiles.has(normalizedSrc)) {
      return normalizedSrc;
    }
  }

  return undefined;
}
