import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutElastic, progress } from "../easing";
import { KeywordData } from "../types";

type Props = {
  data: KeywordData;
};

export const KeywordSlide: React.FC<Props> = ({ data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // キーワードのスケールイン（easeOutElastic）
  const wordScale = easeOutElastic(progress(frame, fps * 0.05, fps * 0.6));
  const wordOpacity = easeOutExpo(progress(frame, fps * 0.05, fps * 0.3));

  // tagline
  const taglineP = easeOutExpo(progress(frame, fps * 0.5, fps * 0.35));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "0 8px",
      }}
    >
      {/* キーワード: グラデーション文字 */}
      <div
        style={{
          fontSize: 108,
          fontWeight: 900,
          background: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
          textAlign: "center",
          fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
          transform: `scale(${wordScale})`,
          opacity: wordOpacity,
          marginBottom: 20,
          textShadow: "none",
          filter: "drop-shadow(0 0 20px rgba(167,139,250,0.4))",
        }}
      >
        {data.word}
      </div>

      {/* タグライン */}
      <div
        style={{
          fontSize: 38,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
          lineHeight: 1.4,
          marginBottom: 36,
          opacity: taglineP,
          transform: `translateY(${(1 - taglineP) * 16}px)`,
          padding: "0 16px",
        }}
      >
        {data.tagline}
      </div>

      {/* ポイント一覧 */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {data.points.map((pt, i) => {
          const p = easeOutExpo(progress(frame, fps * 0.65 + i * fps * 0.18, fps * 0.3));
          return (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: p,
                transform: `translateX(${(1 - p) * 20}px)`,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  color: "#a78bfa",
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                ◆
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
                  lineHeight: 1.4,
                }}
              >
                {pt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
