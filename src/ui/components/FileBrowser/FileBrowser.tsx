import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  FileJson,
  FileText,
  Folder as FolderIcon,
  Globe,
  Palette,
  Code,
} from "lucide-react";
import type { RunnerFile } from "../../../index.js";

type FolderNode = {
  type: "folder";
  name: string;
  path: string;
  children: FileTreeNode[];
};

type FileNode = {
  type: "file";
  name: string;
  path: string;
  file: RunnerFile;
};

type FileTreeNode = FolderNode | FileNode;

type FolderBuilder = {
  name: string;
  path: string;
  folders: Map<string, FolderBuilder>;
  files: Map<string, RunnerFile>;
};

export type FileBrowserProps = {
  files?: RunnerFile[];
  activePath?: string | null;
  defaultExpanded?: boolean;
  className?: string;
  onSelect?: (file: RunnerFile) => void;
};

const ICON_SIZE = 14;

export function FileBrowser({
  files = [],
  activePath,
  defaultExpanded = true,
  className = "",
  onSelect,
}: FileBrowserProps) {
  const [internalActivePath, setInternalActivePath] = useState<string | null>(
    null
  );

  const resolvedActivePath =
    activePath !== undefined ? activePath : internalActivePath;

  useEffect(() => {
    if (activePath !== undefined) {
      setInternalActivePath(activePath);
    }
  }, [activePath]);

  const tree = useMemo<FileTreeNode[]>(() => {
    return buildFileTree(files);
  }, [files]);

  const defaultExpandedPaths = useMemo(() => {
    if (!defaultExpanded) {
      return new Set<string>();
    }

    const paths = new Set<string>();
    const walk = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        if (node.type === "folder") {
          paths.add(node.path);
          walk(node.children);
        }
      }
    };
    walk(tree);
    return paths;
  }, [tree, defaultExpanded]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => defaultExpandedPaths
  );

  useEffect(() => {
    setExpandedPaths(defaultExpandedPaths);
  }, [defaultExpandedPaths]);

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileSelect = (node: FileNode) => {
    if (activePath === undefined) {
      setInternalActivePath(node.path);
    }
    onSelect?.(node.file);
  };

  return (
    <div className={`file-browser ${className}`.trim()}>
      {files.length === 0 ? (
        <div className="empty-message">No files</div>
      ) : (
        <FileTree
          nodes={tree}
          expandedPaths={expandedPaths}
          onToggleFolder={toggleFolder}
          onSelectFile={handleFileSelect}
          activePath={resolvedActivePath}
        />
      )}
    </div>
  );
}

type FileTreeProps = {
  nodes: FileTreeNode[];
  expandedPaths: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelectFile: (node: FileNode) => void;
  activePath: string | null | undefined;
};

function FileTree({
  nodes,
  expandedPaths,
  onToggleFolder,
  onSelectFile,
  activePath,
}: FileTreeProps) {
  return (
    <ul className="file-tree">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          expandedPaths={expandedPaths}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          activePath={activePath}
        />
      ))}
    </ul>
  );
}

type FileTreeItemProps = {
  node: FileTreeNode;
  expandedPaths: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelectFile: (node: FileNode) => void;
  activePath: string | null | undefined;
};

function FileTreeItem({
  node,
  expandedPaths,
  onToggleFolder,
  onSelectFile,
  activePath,
}: FileTreeItemProps) {
  if (node.type === "folder") {
    const isExpanded = expandedPaths.has(node.path);
    return (
      <li className="folder-node">
        <div
          className="item folder-item"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFolder(node.path);
          }}
        >
          <span className="icon toggle-icon">
            {isExpanded ? (
              <ChevronDown size={ICON_SIZE} />
            ) : (
              <ChevronRight size={ICON_SIZE} />
            )}
          </span>
          <span className="icon folder-icon">
            <FolderIcon size={ICON_SIZE} />
          </span>
          <span className="label">{node.name}</span>
        </div>
        <ul
          className="file-tree nested"
          style={{ display: isExpanded ? "block" : "none" }}
        >
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              expandedPaths={expandedPaths}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              activePath={activePath}
            />
          ))}
        </ul>
      </li>
    );
  }

  const IconComponent = getFileIconComponent(node.name);
  const isActive = node.path === activePath;

  return (
    <li>
      <div
        className={`item file-item${isActive ? " active" : ""}`}
        data-path={node.path}
        onClick={(event) => {
          event.stopPropagation();
          onSelectFile(node);
        }}
      >
        <span className="icon file-icon">
          <IconComponent size={ICON_SIZE} />
        </span>
        <span className="label">{node.name}</span>
      </div>
    </li>
  );
}

function getFileIconComponent(filename: string) {
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
      return FileIcon;
  }
}

function buildFileTree(files: RunnerFile[]): FileTreeNode[] {
  const root: FolderBuilder = {
    name: "",
    path: "",
    folders: new Map(),
    files: new Map(),
  };

  for (const file of files) {
    const parts = file.path.split("/");
    let currentFolder = root;
    const traversed: string[] = [];

    parts.forEach((segment, index) => {
      traversed.push(segment);
      const currentPath = traversed.join("/");
      const isFile = index === parts.length - 1;

      if (isFile) {
        currentFolder.files.set(segment, file);
      } else {
        if (!currentFolder.folders.has(segment)) {
          currentFolder.folders.set(segment, {
            name: segment,
            path: currentPath,
            folders: new Map(),
            files: new Map(),
          });
        }
        currentFolder = currentFolder.folders.get(segment)!;
      }
    });
  }

  return convertFolderToTree(root);
}

function convertFolderToTree(folder: FolderBuilder): FileTreeNode[] {
  const folderNodes: FolderNode[] = Array.from(folder.folders.values())
    .map((child) => ({
      type: "folder" as const,
      name: child.name,
      path: child.path,
      children: convertFolderToTree(child),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const fileNodes: FileNode[] = Array.from(folder.files.entries())
    .map(([name, file]) => ({
      type: "file" as const,
      name,
      path: file.path,
      file,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...folderNodes, ...fileNodes];
}
