"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentProps, ReactNode } from "react";
import Mermaid from "./Mermaid";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function isMermaidCode(child: ReactNode): boolean {
  if (!child || typeof child !== "object" || !("props" in child)) return false;
  const className = (child as { props: { className?: string } }).props.className;
  return typeof className === "string" && className.includes("language-mermaid");
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-tg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // mermaid のコードブロックは <pre> を使わず図として描画
          pre({ children }: ComponentProps<"pre">) {
            if (isMermaidCode(children)) {
              return <Mermaid chart={extractText(children).trim()} />;
            }
            return <pre>{children}</pre>;
          },
          code({ className, children, ...props }: ComponentProps<"code">) {
            if (typeof className === "string" && className.includes("language-mermaid")) {
              // pre 側で処理するため、ここでは素通し
              return <code className={className}>{children}</code>;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
