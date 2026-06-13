import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, progress } from "../easing";
import { BulletsData } from "../types";

type Props = {
  data: BulletsData;
};

export const BulletsSlide: React.FC<Props> = ({ data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const fontSize = data.items.length >= 4 ? 34 : 40;

  // アイテム数に応じてgapを調整（多いほど狭く）
  const gap = data.items.length >= 4 ? 16 : data.items.length >= 3 ? 22 : 30;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap,
        padding: "8px 0",
      }}
    >
      {data.items.map((item, i) => {
        const startFrame = fps * 0.1 + i * fps * 0.2;
        const p = easeOutExpo(progress(frame, startFrame, fps * 0.35));

        return (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "30px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: p,
              transform: `translateX(${(1 - p) * -30}px)`,
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: "#38bdf8",
                fontWeight: 900,
                flexShrink: 0,
                textShadow: "0 0 10px rgba(56,189,248,0.6)",
              }}
            >
              ▶
            </span>
            <span
              style={{
                fontSize,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.4,
                fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
              }}
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
};
