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

// extract all CSS (in head and body)
// extract all <link> (with a relative path)
// and <style> CSS
export function extractCssLoadedInHtml(
  htmlContent: string,
  files: RunnerFile[]
): { linkedFiles: string[]; inlineStyles: string[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const linkedFiles: string[] = [];
  const inlineStyles: string[] = [];

  // Create a set of available file paths for quick lookup
  const availableFiles = new Set(files.map((file) => file.path));

  // Extract CSS from <link> tags with relative paths
  const linkTags = doc.querySelectorAll('link[rel="stylesheet"][href]');
  for (const link of linkTags) {
    const href = link.getAttribute("href");
    if (!href) continue;

    // Skip external URLs (http, https, //, etc.)
    if (
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("/")
    ) {
      continue;
    }

    // Check if the href path matches any available file directly
    if (availableFiles.has(href)) {
      linkedFiles.push(href);
    } else {
      // Also check with normalized paths (remove leading ./ if present)
      const normalizedHref = href.startsWith("./") ? href.slice(2) : href;
      if (availableFiles.has(normalizedHref)) {
        linkedFiles.push(normalizedHref);
      }
    }
  }

  // Extract inline CSS from <style> tags
  const styleTags = doc.querySelectorAll("style");
  for (const style of styleTags) {
    const cssContent = style.textContent;
    if (cssContent && cssContent.trim()) {
      inlineStyles.push(cssContent);
    }
  }

  return { linkedFiles, inlineStyles };
}
