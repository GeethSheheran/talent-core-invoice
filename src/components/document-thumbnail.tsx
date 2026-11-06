"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
export function DocumentThumbnail({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setScale(node.clientWidth / ((210 * 96) / 25.4)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={container}
      className="document-thumbnail"
      aria-label="Invoice document preview"
    >
      <div style={{ transform: `scale(${scale})` }}>{children}</div>
    </div>
  );
}
