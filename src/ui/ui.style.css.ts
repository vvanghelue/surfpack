/**
 * UI styles
 * Left to right :
 * - File browser (file tree)
 * - Code editor (text area)
 * - Iframe bundler (preview area):
 *   Top to bottom :
 *      - Navigator (bar with URL and controls)
 *      - Iframe (bundled app)
 */
const styles = `
    .surfpack-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
        display: flex;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
    }
    .surfpack-ui * {
        box-sizing: border-box;
    }

    /* File Browser Styles */
    .surfpack-file-browser {
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
        width: 250px;
        height: 100%;
        overflow: auto;
    }
    .surfpack-file-browser .file-browser {
        height: 100%;
        overflow-y: auto;
        padding: 8px;
        background-color: #f8f9fa;
    }
    .surfpack-file-browser .empty-message {
        color: #666;
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
    }
    .surfpack-file-browser .item:hover {
        background-color: #e9ecef;
    }
    .surfpack-file-browser .file-item.active {
        background-color: #007acc !important;
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
        background-color: #ffffff;
        position: relative;
        flex: 1;
        height: 100%;
        border-right: 1px solid #ddd;
        overflow: hidden;
    }
    .surfpack-code-editor .cm-editor {
        height: 100%;
        border: none;
        outline: none;
    }
    .surfpack-code-editor .cm-focused {
        outline: none;
    }

    /* Preview Area Styles */
    .surfpack-iframe-bundler-container {
        background-color: #ffffff;
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 400px;
        height: 100%;
    }
    .surfpack-iframe-bundler-navigator {
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
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
    .surfpack-navigator-url {
        flex: 1;
        padding: 4px 8px;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        color: #666;
    }
    .surfpack-navigator-refresh {
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
    }
    .surfpack-navigator-refresh:hover {
        background-color: #f0f0f0;
    }
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
