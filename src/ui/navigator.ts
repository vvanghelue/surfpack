import { createIcon, icons } from "./icons.js";

export class Navigator {
  private container: HTMLElement;
  private urlInput: HTMLInputElement;
  private refreshButton: HTMLButtonElement;
  private currentUrl: string = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.urlInput = document.createElement("input");
    this.refreshButton = document.createElement("button");
    this.setupNavigator();
  }

  private setupNavigator(): void {
    // URL input (always visible)
    this.urlInput.className = "surfpack-navigator-input";
    this.urlInput.type = "text";
    this.urlInput.placeholder = "/";
    this.urlInput.value = "/"; // Start with root path
    this.urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newUrl = this.urlInput.value.trim();
        if (newUrl && newUrl !== this.currentUrl) {
          this.onNavigateCallback?.(newUrl);
        }
      }
    });

    // Refresh button
    this.refreshButton.className = "surfpack-navigator-refresh";
    const refreshIcon = createIcon(icons.refresh, {
      size: 16,
      title: "Refresh",
    });
    this.refreshButton.appendChild(refreshIcon);

    this.container.appendChild(this.urlInput);
    this.container.appendChild(this.refreshButton);
  }

  private onRefreshCallback?: () => void;
  private onNavigateCallback?: (url: string) => void;

  setUrl(url: string): void {
    this.currentUrl = url;

    // Extract just the pathname (like location.pathname)
    let pathname = "/";
    try {
      if (url && url !== "about:blank") {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          const urlObj = new URL(url);
          pathname = urlObj.pathname;
        } else if (url.startsWith("/")) {
          // Extract just the pathname part (before ? or #)
          pathname = url.split("?")[0].split("#")[0];
        } else {
          pathname = "/" + url.split("?")[0].split("#")[0];
        }
      }
    } catch (error) {
      pathname = "/";
    }

    this.urlInput.value = pathname;
  }

  onRefresh(callback: () => void): void {
    this.onRefreshCallback = callback;
    this.refreshButton.addEventListener("click", callback);
  }

  onNavigate(callback: (url: string) => void): void {
    this.onNavigateCallback = callback;
  }

  getCurrentRoute(): string {
    return this.urlInput.value || "/";
  }

  destroy(): void {
    // Clean up any event listeners if needed
  }
}
