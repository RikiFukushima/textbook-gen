import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, progress } from "../easing";
import { CompareData } from "../types";

type Props = {
  data: CompareData;
};

export const CompareSlide: React.FC<Props> = ({ data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const leftP = easeOutBack(progress(frame, fps * 0.05, fps * 0.4));
  const rightP = easeOutBack(progress(frame, fps * 0.3, fps * 0.4));

  const renderCard = (
    label: string,
    points: string[],
    isLeft: boolean,
    p: number
  ) => {
    const bg = isLeft ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)";
    const border = isLeft ? "rgba(239,68,68,0.4)" : "rgba(52,211,153,0.4)";
    const labelColor = isLeft ? "#f87171" : "#34d399";
    const icon = isLeft ? "✕" : "✓";
    const iconColor = isLeft ? "#f87171" : "#34d399";
    const translateY = isLeft ? -24 : 24;

    return (
      <div
        style={{
          background: bg,
          backdropFilter: "blur(20px)",
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: "28px 32px",
          opacity: p,
          transform: `translateY(${(1 - p) * translateY}px) scale(${0.94 + p * 0.06})`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {/* ラベル行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: isLeft ? "rgba(239,68,68,0.25)" : "rgba(52,211,153,0.25)",
              border: `2px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 900,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: labelColor,
              fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
              textShadow: isLeft
                ? "0 0 12px rgba(239,68,68,0.4)"
                : "0 0 12px rgba(52,211,153,0.4)",
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
        </div>

        {/* ポイントリスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {points.map((pt, i) => {
            const itemP = easeOutExpo(
              progress(frame, fps * (isLeft ? 0.2 : 0.45) + i * fps * 0.1, fps * 0.3)
            );
            return (
              <div
                key={i}
                style={{
                  background: isLeft
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(52,211,153,0.1)",
                  border: `1px solid ${border}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                  fontSize: 34,
                  fontWeight: 600,
                  color: "#ffffff",
                  lineHeight: 1.4,
                  fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
                  opacity: itemP,
                  transform: `translateX(${(1 - itemP) * (isLeft ? -16 : 16)}px)`,
                }}
              >
                {pt}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 24,
        paddingTop: 16,
        boxSizing: "border-box",
      }}
    >
      {renderCard(data.left.label, data.left.points, true, leftP)}
      {renderCard(data.right.label, data.right.points, false, rightP)}
    </div>
  );
};
