"use client";
import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;
function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "strict",
    themeVariables: {
      fontSize: "14px",
    },
  });
  initialized = true;
}

export default function Mermaid({ chart }: { chart: string }) {
  const rawId = useId().replace(/[:]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureInit();
    mermaid
      .render(`m-${rawId}`, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [chart, rawId]);

  if (error) {
    return (
      <pre className="text-xs text-red-400">図の描画に失敗しました: {error}</pre>
    );
  }
  return <div className="mermaid-wrap" ref={ref} aria-label="diagram" />;
}
