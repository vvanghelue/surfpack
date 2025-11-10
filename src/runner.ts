export type InitOptions = {
  bundlerUrl?: string;
  container: HTMLElement;
  files: File[];
  debugMode?: boolean;
  onBundleComplete?: (output: string) => void;
  onBundleError?: (error: Error) => void;
  onPageStateChange?: (url: string) => void;
};

function createIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  return iframe;
}

export function init(options: InitOptions) {

  options.debugMode = options.debugMode || false;

  const iframe = createIframe();
  options.container.appendChild(iframe);
  iframe.src = options.bundlerUrl || "dev-bundler.html";

  return {
    destroy() {
      options.container.removeChild(iframe);
    },
    updateFiles(files: File[]) {},
    updateFile(files: File[]) {}
  }
}
