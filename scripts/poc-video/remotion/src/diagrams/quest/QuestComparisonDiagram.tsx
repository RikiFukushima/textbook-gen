import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, progress } from "../../easing";

type Props = { accentColor: string };

function Card({
  label,
  items,
  isWrong,
  color,
  startFrame,
}: {
  label: string;
  items: { icon: string; text: string; sub?: string }[];
  isWrong: boolean;
  color: string;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = easeOutBack(progress(frame, startFrame, fps * 0.45));

  return (
    <div
      style={{
        flex: 1,
        background: isWrong
          ? "rgba(255,255,255,0.04)"
          : `rgba(${color === "#00d2c8" ? "0,210,200" : "255,107,74"},0.08)`,
        border: `2px solid ${isWrong ? "rgba(255,255,255,0.1)" : color}`,
        borderRadius: 20,
        padding: "28px 20px",
        opacity: p,
        transform: `scale(${0.85 + p * 0.15}) translateY(${(1 - p) * 20}px)`,
      }}
    >
      {/* ラベル */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: isWrong ? "rgba(255,255,255,0.4)" : color,
          letterSpacing: "0.1em",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        {label}
      </div>

      {/* アイテム */}
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: isWrong
              ? "rgba(255,255,255,0.05)"
              : `rgba(${color === "#00d2c8" ? "0,210,200" : "255,107,74"},0.12)`,
            borderRadius: 12,
            padding: "16px 14px",
            marginBottom: i < items.length - 1 ? 12 : 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>{item.icon}</span>
          <div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: isWrong ? "rgba(255,255,255,0.5)" : "#ffffff",
              }}
            >
              {item.text}
            </div>
            {item.sub && (
              <div
                style={{
                  fontSize: 22,
                  color: isWrong ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)",
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 誤解カード: ✕スタンプ */}
      {isWrong && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            fontSize: 64,
            color: "rgba(255,80,80,0.7)",
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          ✕
        </div>
      )}
    </div>
  );
}

export const QuestComparisonDiagram: React.FC<Props> = ({ accentColor }) => {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        height: "100%",
        position: "relative",
      }}
    >
      {/* 左: 誤解 */}
      <div style={{ flex: 1, position: "relative" }}>
        <Card
          label="❌ よくある誤解"
          items={[
            { icon: "🔍", text: "検索", sub: "ベクトル検索するだけ" },
            { icon: "🤖", text: "LLM", sub: "あとはAIに任せる" },
          ]}
          isWrong={true}
          color="#ff5050"
          startFrame={fps * 0.15}
        />
      </div>

      {/* VS バッジ */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#1a1a2e",
          border: `2px solid ${accentColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 900,
          color: accentColor,
          zIndex: 10,
          boxShadow: `0 0 20px ${accentColor}44`,
        }}
      >
        VS
      </div>

      {/* 右: 実際 */}
      <div style={{ flex: 1, position: "relative" }}>
        <Card
          label="✅ 実際は"
          items={[
            { icon: "📑", text: "Index", sub: "索引を設計する" },
            { icon: "⚡", text: "Query", sub: "問い合わせを設計する" },
          ]}
          isWrong={false}
          color={accentColor}
          startFrame={fps * 0.4}
        />
      </div>
    </div>
  );
};
