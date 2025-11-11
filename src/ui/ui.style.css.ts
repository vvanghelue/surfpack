/**
 * UI styles
 * Left to right :
 * - File browser (file tree)
 * - Code editor (text area)
 * - Iframe bundler (preview area):
 *   Top to bottom :
 *      - Navigator (bar with URL and controls)
 *      - Iframe (bundled app)
 *      - Bottom overlay (150px height) with debug log messages (optional)
 */
const styles = `
    /* CSS Variables for Dark Mode */
    :root {
        /* Light mode (default) */
        --surfpack-background: #ffffff;
        --surfpack-foreground: #333333;
        --surfpack-muted-background: #f8f9fa;
        --surfpack-muted-foreground: #666666;
        --surfpack-border: #e9ecef;
        --surfpack-accent: #007acc;
        --surfpack-hover-background: #e9ecef;
    }
    
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
        :root {
            --surfpack-background: #1e1e1e;
            --surfpack-foreground: #d4d4d4;
            --surfpack-muted-background: #2d2d30;
            --surfpack-muted-foreground: #969696;
            --surfpack-border: #3e3e42;
            --surfpack-accent: #0078d4;
            --surfpack-hover-background: #3e3e42;
        }
    }
    
    /* Manual dark mode class override */
    .surfpack-ui.dark-mode {
        --surfpack-background: #1e1e1e;
        --surfpack-foreground: #d4d4d4;
        --surfpack-muted-background: #2d2d30;
        --surfpack-muted-foreground: #969696;
        --surfpack-border: #3e3e42;
        --surfpack-accent: #0078d4;
        --surfpack-hover-background: #3e3e42;
    }
    
    /* Manual light mode class override */
    .surfpack-ui.light-mode {
        --surfpack-background: #ffffff;
        --surfpack-foreground: #333333;
        --surfpack-muted-background: #f8f9fa;
        --surfpack-muted-foreground: #666666;
        --surfpack-border: #e9ecef;
        --surfpack-accent: #007acc;
        --surfpack-hover-background: #e9ecef;
    }

    .surfpack-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
        display: flex;
        border: 1px solid var(--surfpack-border);
        __border-radius: 4px;
        __box-shadow: 0 4px 12px -1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        background-color: var(--surfpack-background);
        color: var(--surfpack-foreground);
    }
    .surfpack-ui * {
        box-sizing: border-box;
    }

    /* File Browser Styles */
    .surfpack-file-browser {
        background-color: var(--surfpack-background);
        border-right: 1px solid var(--surfpack-border);
        width: 250px;
        height: 100%;
        overflow: auto;
    }
    .surfpack-file-browser .file-browser {
        height: 100%;
        overflow-y: auto;
        padding: 8px;
        background-color: var(--surfpack-muted-background);
    }
    .surfpack-file-browser .empty-message {
        color: var(--surfpack-muted-foreground);
        padding: 8px;
    }
    .surfpack-file-browser .file-tree {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .surfpack-file-browser .file-tree li {
        margin: 2px 0;
    }
    .surfpack-file-browser .nested {
        margin-left: 16px;
    }
    .surfpack-file-browser .item {
        cursor: pointer;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        border-radius: 4px;
        color: var(--surfpack-foreground);
    }
    .surfpack-file-browser .item:hover {
        background-color: var(--surfpack-hover-background);
    }
    .surfpack-file-browser .file-item.active {
        background-color: var(--surfpack-accent) !important;
        color: white !important;
    }
    .surfpack-file-browser .toggle-icon {
        margin-right: 4px;
        font-size: 12px;
    }
    .surfpack-file-browser .file-icon,
    .surfpack-file-browser .folder-icon {
        margin-right: 6px;
    }

    /* Code Editor Styles */
    .surfpack-code-editor {
        position: relative;
        flex: 1;
        height: 100%;
        border-right: 1px solid var(--surfpack-border);
        overflow: hidden;
    }

    /* Preview Area Styles */
    .surfpack-iframe-bundler-container {
        background-color: var(--surfpack-background);
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 400px;
        height: 100%;
    }
    .surfpack-iframe-bundler-navigator {
        background-color: var(--surfpack-muted-background);
        border-bottom: 1px solid var(--surfpack-border);
        min-height: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        padding: 8px;
        gap: 8px;
    }
    .surfpack-iframe-bundler-iframe {
        flex: 1;
        position: relative;
        overflow: hidden;
        height: 100%;
    }
    .surfpack-iframe-bundler-iframe iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    /* Navigator Styles */
    .surfpack-navigator-input {
        flex: 1;
        padding: 4px 8px;
        background-color: var(--surfpack-background);
        border: 1px solid var(--surfpack-border);
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        color: var(--surfpack-foreground);
        outline: none;
        transition: border-color 0.2s ease;
    }
    
    .surfpack-navigator-input:focus {
        border-color: var(--surfpack-accent);
    }
    
    .surfpack-navigator-refresh {
        padding: 4px 8px;
        border: 1px solid var(--surfpack-border);
        border-radius: 4px;
        background-color: var(--surfpack-background);
        color: var(--surfpack-foreground);
        cursor: pointer;
        font-size: 12px;
    }
    
    .surfpack-navigator-refresh:hover {
        background-color: var(--surfpack-hover-background);
    }

    .surfpack-debug-log {}
`;

let stylesApplied = false;

export function applyUiStyles(): void {
  if (!window || stylesApplied) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
  stylesApplied = true;
}
