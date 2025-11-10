export * from "./bundler/bundler.js";

// export type InitOptions = {
//   container: HTMLElement;
//   files: File[];
//   onFileSelect?: (path: string) => void;
// };

// function createIframe(container: HTMLElement): HTMLIFrameElement {
//   const iframe = document.createElement("iframe");
//   iframe.style.width = "100%";
//   iframe.style.height = "100%";
//   iframe.style.border = "none";
//   container.appendChild(iframe);
//   return iframe;
// }

// export function init(options: InitOptions) {
//   const iframe = createIframe(options.container);
//   iframe.src = "dev-bundler.html";
// }
