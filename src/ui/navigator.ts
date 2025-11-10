export class Navigator {
  private container: HTMLElement;
  private urlDisplay: HTMLElement;
  private refreshButton: HTMLButtonElement;
  private currentUrl: string = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.urlDisplay = document.createElement("div");
    this.refreshButton = document.createElement("button");
    this.setupNavigator();
  }

  private setupNavigator(): void {
    // URL display
    this.urlDisplay.className = "surfpack-navigator-url";
    this.urlDisplay.textContent = "Loading...";

    // Refresh button
    this.refreshButton.className = "surfpack-navigator-refresh";
    this.refreshButton.textContent = "⟳";
    this.refreshButton.title = "Refresh";

    this.container.appendChild(this.urlDisplay);
    this.container.appendChild(this.refreshButton);
  }

  setUrl(url: string): void {
    this.currentUrl = url;
    this.urlDisplay.textContent = url || "about:blank";
  }

  onRefresh(callback: () => void): void {
    this.refreshButton.addEventListener("click", callback);
  }

  destroy(): void {
    // Clean up any event listeners if needed
  }
}
