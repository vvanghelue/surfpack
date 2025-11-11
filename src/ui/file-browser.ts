import type { RunnerFile } from "../index.js";
import { createIcon, getFileIcon, icons } from "./icons.js";

interface FileTreeNode {
  [name: string]: FileTreeNode;
}

export class FileBrowser {
  private container: HTMLElement;
  private files: RunnerFile[] = [];
  private activePath: string | null = null;
  public onFileSelect?: (file: RunnerFile) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.classList.add("file-browser");
  }

  setFiles(files: RunnerFile[]): void {
    this.files = files;
    this.render();
  }

  render(): void {
    this.container.innerHTML = "";
    if (this.files.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "No files";
      this.container.appendChild(emptyMessage);
      return;
    }

    const tree = this.buildTree();
    const treeElement = this.renderTree(tree);
    this.container.appendChild(treeElement);
    this.highlightActivePath();
  }

  private buildTree(): FileTreeNode {
    const tree: FileTreeNode = {};
    for (const file of this.files) {
      const parts = file.path.split("/");
      let current = tree;
      for (const part of parts) {
        current[part] ||= {} as FileTreeNode;
        current = current[part];
      }
    }
    return tree;
  }

  private renderTree(node: FileTreeNode, path = ""): HTMLUListElement {
    const ul = document.createElement("ul");
    ul.className = "file-tree";

    const entries = (Object.entries(node) as [string, FileTreeNode][]).sort(
      (a, b) => {
        const aIsFolder = Object.keys(a[1]).length > 0;
        const bIsFolder = Object.keys(b[1]).length > 0;
        if (aIsFolder !== bIsFolder) {
          return aIsFolder ? -1 : 1;
        }
        return a[0].localeCompare(b[0]);
      }
    );

    for (const [name, children] of entries) {
      const fullPath = path ? `${path}/${name}` : name;
      const li = document.createElement("li");

      if (Object.keys(children).length === 0) {
        const item = this.createFileItem(name, fullPath);
        li.appendChild(item);
      } else {
        const item = this.createFolderItem(name);
        const nested = this.renderTree(children, fullPath);
        nested.classList.add("nested");
        li.classList.add("folder-node");
        li.append(item, nested);

        item.addEventListener("click", (event: MouseEvent) => {
          event.stopPropagation();
          const collapsed = nested.style.display === "none";
          nested.style.display = collapsed ? "block" : "none";

          // Update toggle icon
          const toggleIconElement = item.querySelector(".toggle-icon");
          if (toggleIconElement) {
            toggleIconElement.innerHTML = "";
            const newToggleIcon = createIcon(
              collapsed ? icons.chevronDown : icons.chevronRight,
              { className: "toggle-icon", title: "Toggle folder" }
            );
            const svgElement = newToggleIcon.querySelector("svg");
            if (svgElement) {
              toggleIconElement.appendChild(svgElement);
            }
          }
        });
      }

      ul.appendChild(li);
    }

    return ul;
  }

  private createFolderItem(name: string): HTMLDivElement {
    const item = document.createElement("div");
    item.className = "item folder-item";

    const toggleIcon = createIcon(icons.chevronDown, {
      className: "toggle-icon",
      size: 14,
      title: "Toggle folder",
    });

    const folderIcon = createIcon(icons.folder, {
      className: "folder-icon",
      size: 14,
    });

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = name;

    item.append(toggleIcon, folderIcon, label);
    return item;
  }

  private createFileItem(name: string, path: string): HTMLDivElement {
    const item = document.createElement("div");
    item.className = "item file-item";
    item.dataset.path = path;

    const fileIcon = createIcon(getFileIcon(name), {
      className: "file-icon",
    });

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = name;

    item.append(fileIcon, label);

    item.addEventListener("click", (event: MouseEvent) => {
      event.stopPropagation();
      this.selectFile(path);
    });

    return item;
  }

  selectFile(path: string): void {
    this.activePath = path;
    this.highlightActivePath();

    const file = this.files.find((f) => f.path === path);
    if (file && this.onFileSelect) {
      this.onFileSelect(file);
    }
  }

  private highlightActivePath(): void {
    const items = this.container.querySelectorAll<HTMLDivElement>(".file-item");
    for (const item of items) {
      if (item.dataset.path === this.activePath) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
  }

  destroy(): void {
    // Clean up any event listeners if needed
  }
}
