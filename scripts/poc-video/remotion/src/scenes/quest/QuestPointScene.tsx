import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, progress } from "../../easing";
import { DiagramKind } from "../../types";
import { QuestComparisonDiagram } from "../../diagrams/quest/QuestComparisonDiagram";
import { QuestFlowDiagram } from "../../diagrams/quest/QuestFlowDiagram";
import { QuestVersusDiagram } from "../../diagrams/quest/QuestVersusDiagram";

type Props = {
  label: string;
  caption: string;
  // 「誤解→実際は」の反転テキスト
  misconception?: string;    // ❌ よくある誤解
  revelation?: string;       // ✅ 実際は
  index: number;
  total: number;
  diagram?: DiagramKind;
};

// シーンごとのアクセントカラー
const ACCENT_COLORS = ["#ff6b4a", "#00d2c8", "#a78bfa"];

// タイプライター風: 文字が1文字ずつ出現
function TypewriterText({
  text,
  fontSize,
  color,
  startFrame,
  totalDuration,
  style,
}: {
  text: string;
  fontSize: number;
  color: string;
  startFrame: number;
  totalDuration: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const charCount = text.length;
  const p = easeOutExpo(progress(frame, startFrame, totalDuration));
  const visibleCount = Math.floor(p * charCount);

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
        fontWeight: 800,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transition: "opacity 0.05s",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export const QuestPointScene: React.FC<Props> = ({
  label,
  caption,
  misconception,
  revelation,
  index,
  total,
  diagram = "none",
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const hasDiagram = diagram !== "none";

  // 上部プログレスバー
  const progressW = ((index + 1) / total) * 100;

  const lines = caption.split("\n");

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(170deg, #0f0c29 0%, #1a1a2e 40%, #16213e 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Hiragino Sans", sans-serif',
      }}
    >
      {/* 背景グロー */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
          opacity: easeOutExpo(progress(frame, 0, fps * 0.5)),
        }}
      />

      {/* 上部プログレスバー */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${easeOutExpo(progress(frame, fps * 0.3, fps * 0.6)) * progressW}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            boxShadow: `0 0 10px ${accent}88`,
          }}
        />
      </div>

      {/* ━━ ラベル ━━ */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: easeOutExpo(progress(frame, fps * 0.05, fps * 0.3)),
          transform: `translateX(${(1 - easeOutExpo(progress(frame, fps * 0.05, fps * 0.3))) * -40}px)`,
        }}
      >
        <div
          style={{
            width: 6,
            height: 36,
            background: accent,
            borderRadius: 3,
            boxShadow: `0 0 10px ${accent}88`,
          }}
        />
        <span
          style={{
            fontSize: 28,
            color: accent,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
      </div>

      {/* ━━ キャプション ━━ */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 80,
          right: 80,
        }}
      >
        {lines.map((line, i) => {
          const maxW = 920;
          const baseSize = hasDiagram ? 72 : 96;
          const calcSize = line.length > 0
            ? Math.min(baseSize, Math.floor(maxW / line.length / 0.95))
            : baseSize;
          const fs = Math.max(44, calcSize);

          return (
            <TypewriterText
              key={i}
              text={line}
              fontSize={fs}
              color="#ffffff"
              startFrame={fps * (0.15 + i * 0.2)}
              totalDuration={fps * 0.5}
              style={{ marginBottom: 6 }}
            />
          );
        })}

        {/* キャプション下線 */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${accent}, transparent)`,
            width: `${easeOutExpo(progress(frame, fps * 0.4, fps * 0.4)) * 100}%`,
            borderRadius: 2,
            marginTop: 16,
            boxShadow: `0 0 8px ${accent}66`,
          }}
        />
      </div>

      {/* ━━ 誤解→実際は(misconception/revelation) ━━ */}
      {(misconception || revelation) && !hasDiagram && (
        <div
          style={{
            position: "absolute",
            top: 500,
            left: 80,
            right: 80,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {misconception && (
            <div
              style={{
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.2)",
                borderRadius: 16,
                padding: "20px 24px",
                opacity: easeOutExpo(progress(frame, fps * 0.5, fps * 0.4)),
                transform: `translateX(${(1 - easeOutExpo(progress(frame, fps * 0.5, fps * 0.4))) * -20}px)`,
              }}
            >
              <span style={{ fontSize: 26, color: "rgba(255,80,80,0.9)", fontWeight: 700 }}>
                ❌ {misconception}
              </span>
            </div>
          )}
          {revelation && (
            <div
              style={{
                background: `rgba(${accent === "#00d2c8" ? "0,210,200" : "255,107,74"},0.08)`,
                border: `1px solid ${accent}44`,
                borderRadius: 16,
                padding: "20px 24px",
                opacity: easeOutExpo(progress(frame, fps * 0.75, fps * 0.4)),
                transform: `translateX(${(1 - easeOutExpo(progress(frame, fps * 0.75, fps * 0.4))) * 20}px)`,
              }}
            >
              <span style={{ fontSize: 26, color: accent, fontWeight: 700 }}>
                ✅ {revelation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ━━ 図解エリア ━━ */}
      {hasDiagram && (
        <div
          style={{
            position: "absolute",
            top: 420,
            left: 60,
            right: 60,
            bottom: 120,
            opacity: easeOutExpo(progress(frame, fps * 0.45, fps * 0.35)),
          }}
        >
          {diagram === "comparison" && (
            <QuestComparisonDiagram accentColor={accent} />
          )}
          {diagram === "flow" && (
            <QuestFlowDiagram accentColor={accent} />
          )}
          {diagram === "versus" && (
            <QuestVersusDiagram accentColor={accent} />
          )}
        </div>
      )}

      {/* ━━ 進捗テキスト ━━ */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          color: "rgba(255,255,255,0.2)",
          fontSize: 26,
          letterSpacing: "0.15em",
          opacity: easeOutExpo(progress(frame, fps * 0.8, fps * 0.3)),
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
};
