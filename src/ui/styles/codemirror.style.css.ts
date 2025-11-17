const styles = `
  .surfpack-code-editor .cm-gutterElement {
    box-sizing: border-box;
    font-size: 8px;
    __line-height: 16px;
    font-family: 'Arial', monospace;
    font-weight: 100;
    margin-top: 0px;
    text-align: right;
  }

  .surfpack-code-editor .cm-gutters.cm-gutters-before {
    border-right-width: 0px;
  }

  .surfpack-code-editor .cm-gutterElement span {

  }
`;

let stylesApplied = false;

export function applyCodeMirrorStyles(): void {
  if (!window || stylesApplied) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
  stylesApplied = true;
}
