import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export type NavigatorProps = {
  route?: string;
  onRouteChange?: (nextRoute: string) => void;
  onNavigate?: (route: string) => void;
  onRefresh?: () => void;
};

export function Navigator({
  route = "/",
  onRouteChange,
  onNavigate,
  onRefresh,
}: NavigatorProps) {
  const [inputValue, setInputValue] = useState(route || "/");
  const committedRouteRef = useRef(route || "/");

  useEffect(() => {
    setInputValue(route || "/");
    committedRouteRef.current = route || "/";
  }, [route]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setInputValue(next);
    onRouteChange?.(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === committedRouteRef.current) {
      return;
    }

    onNavigate?.(trimmed);
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
