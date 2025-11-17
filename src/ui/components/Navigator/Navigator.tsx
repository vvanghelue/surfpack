import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export type NavigatorProps = {
  route: string;
  onUserTriggerRouteChange: (nextRoute: string) => void;
  onRefresh?: () => void;
};

export function Navigator({
  route,
  onUserTriggerRouteChange,
  onRefresh,
}: NavigatorProps) {
  const [inputValue, setInputValue] = useState(route);

  useEffect(() => {
    setInputValue(route);
  }, [route]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setInputValue(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    onUserTriggerRouteChange(trimmed);
  };

  return (
    <>
      <input
        className="surfpack-navigator-input"
        type="text"
        placeholder="/"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="surfpack-navigator-refresh"
        onClick={onRefresh}
        aria-label="Refresh preview"
      >
        <RefreshCw size={14} strokeWidth={1.5} />
      </button>
    </>
  );
}
