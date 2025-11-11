import React from "react";
import type { MutableRefObject } from "react";

export type PreviewProps = {
  areaRef: MutableRefObject<HTMLDivElement | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  showNavigator: boolean;
  navigator?: React.ReactNode;
};

export function Preview({
  areaRef,
  containerRef,
  showNavigator,
  navigator,
}: PreviewProps) {
  return (
    <div ref={areaRef} className="surfpack-iframe-bundler-container">
      {showNavigator && navigator ? (
        <div className="surfpack-iframe-bundler-navigator">{navigator}</div>
      ) : null}
      <div ref={containerRef} className="surfpack-iframe-bundler-iframe" />
    </div>
  );
}
