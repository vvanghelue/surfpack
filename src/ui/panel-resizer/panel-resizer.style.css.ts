const styles = `

    /* Resize handle between panels */
    .surfpack-resize-handle {
        flex: 0 0 1px;
        width: 1px;
        background-color: var(--surfpack-border);
        user-select: none;
        height: auto;
        position: relative;
        z-index: 10;
    }
    .surfpack-resize-handle:after {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 100%;
        cursor: ew-resize;
        __background: red;
        opacity: 0.2;
    }
    .surfpack-resize-handle:hover {
        background-color: var(--surfpack-accent);
    }
    .surfpack-resize-handle.active {
        background-color: var(--surfpack-accent);
    }
`;

let stylesApplied = false;

export function applyResizerStyles(): void {
  if (!window || stylesApplied) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
  stylesApplied = true;
}
