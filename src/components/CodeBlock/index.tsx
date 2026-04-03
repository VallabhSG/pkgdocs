"use client";

import { useState, useEffect, useRef } from "react";
import type { Highlighter } from "shiki";
import CopyButton from "@/components/CopyButton";

// Singleton highlighter — created once, shared across all CodeBlock instances
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["github-light"],
        langs: ["python", "typescript", "javascript", "bash", "json", "shell"],
      })
    );
  }
  return highlighterPromise;
}

interface Props {
  code: string;
  lang?: string;
  showCopy?: boolean;
  className?: string;
}

export default function CodeBlock({ code, lang = "python", showCopy = true, className = "" }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    getHighlighter().then((hl) => {
      if (!mountedRef.current) return;
      const supportedLangs = hl.getLoadedLanguages();
      const safeLang = supportedLangs.includes(lang as never) ? lang : "bash";
      setHtml(hl.codeToHtml(code, { lang: safeLang, theme: "github-light" }));
    });
    return () => { mountedRef.current = false; };
  }, [code, lang]);

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-warm-200 bg-warm-50 ${className}`}>
      {showCopy && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={code} className="bg-white border border-warm-200 rounded-lg px-2 py-1 shadow-sm text-warm-500 hover:text-warm-900" />
        </div>
      )}
      {html ? (
        <div
          className="shiki-wrapper overflow-x-auto text-sm leading-relaxed [&>pre]:p-4 [&>pre]:m-0 [&>pre]:bg-transparent! [&>pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 text-sm leading-relaxed text-warm-700 overflow-x-auto font-mono">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
