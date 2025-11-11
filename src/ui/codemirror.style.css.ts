const styles = `
   .surfpack-code-editor .cm-gutterElement {
        box-sizing: border-box;
        font-size: 8px;
        line-height: 16px;
        font-family: system-ui;
        font-weight: 100;
        margin-top: 0px;
        text-align: right;
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
