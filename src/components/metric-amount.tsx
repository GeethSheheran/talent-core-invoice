"use client";
import { useLayoutEffect, useRef } from "react";

export function MetricAmount({ children }: { children: string }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !text.current) return;
      text.current.style.fontSize = "28px";
      const width = text.current.getBoundingClientRect().width;
      text.current.style.fontSize = `${Math.min(28, (28 * box.current.clientWidth) / Math.max(1, width))}px`;
    };
    const observer = new ResizeObserver(fit);
    if (box.current) observer.observe(box.current);
    fit();
    void document.fonts.ready.then(fit);
    return () => observer.disconnect();
  }, [children]);
  return (
    <div className="value metric-amount" ref={box}>
      <span ref={text}>{children}</span>
    </div>
  );
}
