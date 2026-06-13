import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutElastic, progress } from "../../easing";

type Props = { caption: string };

export const QuestCoverScene: React.FC<Props> = ({ caption }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const lines = caption.split("\n");
  const line1 = lines[0] ?? "";
  const line2 = lines[1] ?? "";

  // ラベルアニメ
  const labelP = easeOutExpo(progress(frame, fps * 0.1, fps * 0.35));

  // 1行目アニメ
  const text1P = easeOutExpo(progress(frame, fps * 0.3, fps * 0.4));

  // 2行目アニメ
  const text2P = easeOutExpo(progress(frame, fps * 0.55, fps * 0.4));

  // アンダーライン
  const lineP = easeOutExpo(progress(frame, fps * 0.75, fps * 0.4));

  // 背景グロー
  const glowP = easeOutExpo(progress(frame, 0, fps * 0.5));

  // 光の球: 左上
  const glow1Scale = easeOutElastic(progress(frame, 0, fps * 0.7));

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background:
          "linear-gradient(135deg, #1a1a4e 0%, #0d1b69 30%, #1e0a4a 70%, #0a1628 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      }}
    >
      {/* 光の球: 左上 */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0.05) 60%, transparent 80%)",
          transform: `scale(${glow1Scale})`,
          opacity: glowP,
        }}
      />

      {/* 光の球: 右下 */}
      <div
        style={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0.05) 60%, transparent 80%)",
          opacity: glowP,
        }}
      />

      {/* ラベル「LESSON」 */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: labelP,
          transform: `translateX(${(1 - labelP) * -40}px)`,
        }}
      >
        <div
          style={{
            width: 6,
            height: 40,
            background: "#38bdf8",
            borderRadius: 3,
            boxShadow: "0 0 14px rgba(56,189,248,0.7)",
          }}
        />
        <span
          style={{
            fontSize: 28,
            color: "#38bdf8",
            fontWeight: 700,
            letterSpacing: "0.2em",
          }}
        >
          LESSON
        </span>
      </div>

      {/* メインキャプション */}
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 80,
          right: 80,
        }}
      >
        {/* 1行目: 白文字 */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.3,
            marginBottom: 8,
            opacity: text1P,
            transform: `translateY(${(1 - text1P) * 24}px)`,
            textShadow: "0 0 30px rgba(255,255,255,0.2)",
          }}
        >
          {line1}
        </div>

        {/* 2行目: スカイブルー */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#38bdf8",
            lineHeight: 1.3,
            marginBottom: 48,
            opacity: text2P,
            transform: `translateY(${(1 - text2P) * 24}px)`,
            textShadow: "0 0 30px rgba(56,189,248,0.4)",
          }}
        >
          {line2}
        </div>

        {/* アンダーライン */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #38bdf8, #a78bfa, transparent)",
            width: `${lineP * 100}%`,
            borderRadius: 2,
            boxShadow: "0 0 12px rgba(56,189,248,0.5)",
          }}
        />
      </div>

      {/* グラスカード: 下部装飾 */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 80,
          right: 80,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "20px 28px",
          opacity: easeOutExpo(progress(frame, fps * 0.9, fps * 0.35)),
          transform: `translateY(${(1 - easeOutExpo(progress(frame, fps * 0.9, fps * 0.35))) * 20}px)`,
        }}
      >
        <span
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          このセクションで学ぶこと
        </span>
      </div>
    </div>
  );
};
