import {
  createElement,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  FileText,
  Code,
  Palette,
  Globe,
  FileJson,
  RefreshCw,
} from "lucide";

/**
 * Creates an icon element from a Lucide icon
 */
export function createIcon(
  icon: any,
  options: {
    size?: number;
    className?: string;
    title?: string;
  } = {}
): HTMLElement {
  const { size = 16, className = "", title } = options;

  const element = document.createElement("span");
  element.className = `icon ${className}`;

  // Use Lucide's createElement function
  const svgElement = createElement(icon, {
    width: size,
    height: size,
    ...(title && { title }),
  });

  // Add custom class to the SVG if needed
  if (className) {
    svgElement.classList.add(className);
  }

  element.appendChild(svgElement);
  return element;
}

/**
 * Icon mapping for different file types
 */
export function getFileIcon(filename: string): any {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return Code;
    case "css":
    case "scss":
    case "sass":
    case "less":
      return Palette;
    case "html":
    case "htm":
      return Globe;
    case "json":
      return FileJson;
    case "md":
    case "txt":
      return FileText;
    default:
      return File;
  }
}

/**
 * Common UI icons
 */
export const icons = {
  // Navigation
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  refresh: RefreshCw,

  // Files and folders
  folder: Folder,
  file: File,
  fileText: FileText,
  code: Code,
  palette: Palette,
  globe: Globe,
  fileJson: FileJson,
} as const;
