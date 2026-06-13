import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, progress } from "../../easing";

type Props = { accentColor: string };

const LANGCHAIN_COLOR = "#ff6b4a";
const LLAMA_COLOR = "#00d2c8";

export const QuestVersusDiagram: React.FC<Props> = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const leftP = easeOutBack(progress(frame, fps * 0.1, fps * 0.45));
  const rightP = easeOutBack(progress(frame, fps * 0.3, fps * 0.45));
  const midP = easeOutExpo(progress(frame, fps * 0.5, fps * 0.35));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        height: "100%",
        justifyContent: "center",
      }}
    >
      {/* 対比ヘッダー */}
      <div
        style={{
          display: "flex",
          gap: 16,
          opacity: midP,
          transform: `translateY(${(1 - midP) * -10}px)`,
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 32,
            fontWeight: 800,
            color: LANGCHAIN_COLOR,
            padding: "14px 0",
            borderBottom: `3px solid ${LANGCHAIN_COLOR}`,
          }}
        >
          LangChain
        </div>
        <div style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.3)" }}>vs</span>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 32,
            fontWeight: 800,
            color: LLAMA_COLOR,
            padding: "14px 0",
            borderBottom: `3px solid ${LLAMA_COLOR}`,
          }}
        >
          LlamaIndex
        </div>
      </div>

      {/* 比較行 */}
      {[
        {
          label: "主役",
          left: { text: "チェーン設計", icon: "⛓️" },
          right: { text: "索引設計", icon: "📑" },
        },
        {
          label: "強み",
          left: { text: "処理フロー連結", icon: "🔗" },
          right: { text: "検索精度向上", icon: "🎯" },
        },
        {
          label: "向いてる用途",
          left: { text: "エージェント・連鎖処理", icon: "🤖" },
          right: { text: "RAG・ドキュメント検索", icon: "📚" },
        },
      ].map((row, i) => {
        const rowP = easeOutExpo(progress(frame, fps * (0.15 + i * 0.15), fps * 0.35));
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "stretch",
              opacity: rowP,
              transform: `translateY(${(1 - rowP) * 12}px)`,
            }}
          >
            {/* 左 */}
            <div
              style={{
                flex: 1,
                background: `rgba(255,107,74,0.08)`,
                border: `1px solid rgba(255,107,74,0.2)`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 30 }}>{row.left.icon}</span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  textAlign: "center",
                }}
              >
                {row.left.text}
              </span>
            </div>

            {/* 真ん中: ラベル */}
            <div
              style={{
                width: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {row.label}
              </span>
            </div>

            {/* 右 */}
            <div
              style={{
                flex: 1,
                background: `rgba(0,210,200,0.08)`,
                border: `1px solid rgba(0,210,200,0.2)`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 30 }}>{row.right.icon}</span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  textAlign: "center",
                }}
              >
                {row.right.text}
              </span>
            </div>
          </div>
        );
      })}

      {/* 結論 */}
      <div
        style={{
          padding: "18px 24px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          textAlign: "center",
          opacity: easeOutExpo(progress(frame, fps * 0.7, fps * 0.35)),
          transform: `scale(${0.95 + easeOutExpo(progress(frame, fps * 0.7, fps * 0.35)) * 0.05})`,
        }}
      >
        <span style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          💡 目的が違う — 競合ではなく使い分け
        </span>
      </div>
    </div>
  );
};
