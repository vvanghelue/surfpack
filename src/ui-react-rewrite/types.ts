import type { RunnerFile } from "../index.js";

export type UiTheme = "light" | "dark" | "device-settings";

export type UiOptions = {
  theme?: UiTheme;
  width?: number | string;
  height?: number | string;
  showCodeEditor?: boolean;
  showFileBrowser?: boolean;
  showNavigator?: boolean;
  codeEditorInitialWidth?: number;
  fileBrowserDefaultExpanded?: boolean;
  debounceDelay?: number;
};

export interface FileBrowserAdapter {
  onFileSelect?: (file: RunnerFile) => void;
  setFiles(files: RunnerFile[]): void;
  selectFile(path: string): void;
  destroy(): void;
}

export interface CodeEditorAdapter {
  loadFile(file: RunnerFile): void;
  setTheme(theme: UiTheme): void;
  updateContent(content: string): void;
  getCurrentFile(): RunnerFile | null;
  destroy(): void;
}

export interface NavigatorAdapter {
  setUrl(url: string): void;
  onRefresh(callback: () => void): void;
  onNavigate(callback: (route: string) => void): void;
  getCurrentRoute(): string;
  destroy(): void;
}

export interface UiComponent {
  container: HTMLElement;
  fileBrowser?: FileBrowserAdapter;
  codeEditor?: CodeEditorAdapter;
  navigator?: NavigatorAdapter;
  previewContainer: HTMLElement;
  setTheme(theme: UiTheme): void;
  toggleCodeEditor(show: boolean): void;
  toggleFileBrowser(show: boolean): void;
  toggleNavigator(show: boolean): void;
  destroy(): void;
}
