import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, progress } from "../easing";
import { StepsData } from "../types";

type Props = {
  data: StepsData;
};

export const StepsSlide: React.FC<Props> = ({ data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // ステップ数に応じてgapを調整
  const gap = data.items.length >= 4 ? 0 : data.items.length >= 3 ? 0 : 4;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {data.items.map((step, i) => {
        const startFrame = fps * 0.1 + i * fps * 0.15;
        const p = easeOutExpo(progress(frame, startFrame, fps * 0.35));

        return (
          <React.Fragment key={i}>
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderLeft: "3px solid #38bdf8",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
              }}
            >
              {/* ステップ番号バッジ */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#ffffff",
                  flexShrink: 0,
                  boxShadow: "0 0 16px rgba(56,189,248,0.45)",
                }}
              >
                {i + 1}
              </div>

              {/* テキスト */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.3,
                    fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
                    marginBottom: 4,
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.4,
                    fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>

            {/* ステップ間の矢印 */}
            {i < data.items.length - 1 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 28,
                  color: "rgba(56,189,248,0.5)",
                  lineHeight: 1,
                  padding: "4px 0",
                  opacity: easeOutExpo(
                    progress(frame, fps * 0.1 + (i + 0.5) * fps * 0.15, fps * 0.25)
                  ),
                }}
              >
                ▼
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
