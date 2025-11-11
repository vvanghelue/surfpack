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
        --surfpack-foreground-ultra: #000000;
        --surfpack-muted-background: #f8f9fa;
        --surfpack-muted-foreground: #666666;
        --surfpack-border: #e9ecef;
        --surfpack-accent: #ffffff3e;
        --surfpack-hover-background: #e9ecef;
    }
    
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
        :root {
            --surfpack-background: #1e1e1e;
            --surfpack-foreground: #d4d4d4;
            --surfpack-foreground-ultra: #ffffff;
            --surfpack-muted-background: #2d2d30;
            --surfpack-muted-foreground: #969696;
            --surfpack-border: #3e3e42;
            --surfpack-accent: #ffffff3e;
            --surfpack-hover-background: #3e3e42;
        }
    }
    
    /* Manual dark mode class override */
    .surfpack-ui.dark-mode {
        --surfpack-background: #1e1e1e;
        --surfpack-foreground: #d4d4d4;
        --surfpack-foreground-ultra: #ffffff;
        --surfpack-muted-background: #2d2d30;
        --surfpack-muted-foreground: #969696;
        --surfpack-border: #3e3e42;
        --surfpack-accent: #ffffff3e;
        --surfpack-hover-background: #3e3e42;
    }
    
    /* Manual light mode class override */
    .surfpack-ui.light-mode {
        --surfpack-background: #ffffff;
        --surfpack-foreground: #333333;
        --surfpack-foreground-ultra: #000000;
        --surfpack-muted-background: #f8f9fa;
        --surfpack-muted-foreground: #666666;
        --surfpack-border: #e9ecef;
        --surfpack-accent: #0000003e;
        --surfpack-hover-background: #e9ecef;
    }

    .surfpack-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
        display: flex;
        border: 1px solid var(--surfpack-border);
        border-radius: 4px;
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
        __border-right: 1px solid var(--surfpack-border);
        width: 250px;
        width: 200px;
        // max-width: 800px;
        height: 100%;
        overflow: auto;
        font-size: 12px;
    }
    .surfpack-file-browser.file-browser {
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
        user-select: none;
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
        background-color: color-mix(in srgb, var(--surfpack-foreground) 10%, transparent) !important;
        color: var(--surfpack-foreground-ultra) !important;
    }
    .surfpack-file-browser .toggle-icon,
    .surfpack-file-browser .file-icon,
    .surfpack-file-browser .folder-icon {
        margin-right: 4px;
        display: flex;
        align-items: center;
    }
    .surfpack-file-browser .toggle-icon {
        margin-right: 2px;
    }
    .surfpack-file-browser .icon svg {
        color: var(--surfpack-muted-foreground);
        transition: color 0.2s ease;
    }
    .surfpack-file-browser .item:hover .icon svg {
        color: var(--surfpack-foreground);
    }
    .surfpack-file-browser .file-item.active .icon svg {
        color: var(--surfpack-foreground-ultra) !important;
    }

    /* Code Editor Styles */
    .surfpack-code-editor {
        position: relative;
        __flex: 1;
        height: 100%;
        __border-right: 1px solid var(--surfpack-border);
        overflow: hidden;
        width: 480px;
    }

    /* Preview Area Styles */
    .surfpack-iframe-bundler-container {
        background-color: var(--surfpack-background);
        flex: 1;
        display: flex;
        flex-direction: column;
        __width: 400px;
        min-width: 200px;
        __max-width: 1200px;
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
        border: 1px solid var(--surfpack-border);
        border-radius: 99px;
        font-size: 12px;
        font-family: monospace;
        outline: none;
        transition: border-color 0.2s ease;
        background: transparent;
        color: var(--surfpack-muted-foreground);
        background-color: var(--surfpack-background);
    }
    
    .surfpack-navigator-input:focus {
        border-color: var(--surfpack-accent);
        background-color: var(--surfpack-background);
        color: var(--surfpack-foreground);
    }
    
    .surfpack-navigator-refresh {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    }
        
    .surfpack-navigator-refresh {
        color: var(--surfpack-muted-foreground);
    }

    .surfpack-navigator-refresh:hover {
        color: var(--surfpack-foreground-ultra);
    }

    .surfpack-navigator-refresh > * {
        display: flex;
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
