import React, { forwardRef } from "react";

export type ResizeHandleProps = React.HTMLAttributes<HTMLDivElement> & {
  hidden?: boolean;
};

export const ResizeHandle = forwardRef<HTMLDivElement, ResizeHandleProps>(
  ({ hidden = false, className = "", style, ...rest }, ref) => {
    const mergedClass = `surfpack-resize-handle ${className}`.trim();
    const displayValue = hidden ? "none" : style?.display;
    const mergedStyle = {
      ...style,
      ...(displayValue !== undefined
        ? { display: displayValue }
        : hidden
          ? { display: "none" }
          : {}),
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={mergedClass}
        role="presentation"
        aria-hidden="true"
        style={mergedStyle}
        {...rest}
      />
    );
  }
);

ResizeHandle.displayName = "ResizeHandle";
