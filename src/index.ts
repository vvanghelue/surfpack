import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Surfpack, type SurfpackProps } from "./ui/components/Surfpack.js";
export * from "./iframe-runner/iframe-runner.js";
export * from "./standalone-runner/standalone-runner.js";
import type { UiTheme } from "./ui/types.js";
export { Surfpack, type SurfpackProps } from "./ui/components/Surfpack.js";

export interface RunnerFile {
  path: string;
  content: string;
}

export type InitOptions = SurfpackProps & {
  container: HTMLElement;
};

export function init(options: InitOptions) {
  let currentPops = { ...options };
  const root: Root = createRoot(options.container);

  function render() {
    root.render(React.createElement(Surfpack, { ...currentPops }));
  }

  render();

  return {
    destroy() {
      root.unmount();
    },
    updateFiles(files: RunnerFile[], entryFile?: string) {
      currentPops = { ...options, files, entryFile };
      render();
    },
    setTheme(theme: UiTheme) {
      currentPops = { ...currentPops, theme };
      render();
    },
    toggleCodeEditor(show: boolean) {
      currentPops = { ...currentPops, showCodeEditor: show };
      render();
    },
    toggleFileBrowser(show: boolean) {
      currentPops = { ...currentPops, showFileBrowser: show };
      render();
    },
    toggleNavigator(show: boolean) {
      currentPops = { ...currentPops, showNavigator: show };
      render();
    },
    render,
  };
}
