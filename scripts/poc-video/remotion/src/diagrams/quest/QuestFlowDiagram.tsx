import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, progress } from "../../easing";

type Props = { accentColor: string };

const STEPS = [
  { num: "01", label: "取込", sub: "Ingestion", desc: "ドキュメントを読み込む", icon: "📥" },
  { num: "02", label: "索引化", sub: "Indexing", desc: "ベクトルインデックスを構築", icon: "🗂️" },
  { num: "03", label: "検索", sub: "Retrieval", desc: "クエリに関連する情報を取得", icon: "🔍" },
  { num: "04", label: "生成", sub: "Synthesis", desc: "LLMが回答を生成", icon: "✨" },
];

export const QuestFlowDiagram: React.FC<Props> = ({ accentColor }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "100%",
        justifyContent: "center",
      }}
    >
      {STEPS.map((step, i) => {
        const p = easeOutBack(progress(frame, fps * (0.1 + i * 0.15), fps * 0.4));
        const isLast = i === STEPS.length - 1;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: p,
                transform: `translateX(${(1 - p) * -30}px)`,
              }}
            >
              {/* 番号バッジ */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                  border: `2px solid ${accentColor}88`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 0 16px ${accentColor}22`,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
                  {step.num}
                </span>
              </div>

              {/* カード */}
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 36 }}>{step.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span
                      style={{
                        fontSize: 38,
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1,
                      }}
                    >
                      {step.label}
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        color: accentColor,
                        fontWeight: 600,
                        opacity: 0.8,
                      }}
                    >
                      {step.sub}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 4,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            </div>

            {/* 矢印 */}
            {!isLast && (
              <div
                style={{
                  paddingLeft: 92,
                  opacity: easeOutExpo(progress(frame, fps * (0.3 + i * 0.15), fps * 0.25)),
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 28,
                    background: `linear-gradient(180deg, ${accentColor}88, ${accentColor}22)`,
                    borderRadius: 1,
                  }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* ポイント: 差し替え可能 */}
      <div
        style={{
          marginTop: 20,
          padding: "16px 24px",
          background: `rgba(${accentColor === "#00d2c8" ? "0,210,200" : "255,107,74"},0.1)`,
          border: `1px solid ${accentColor}44`,
          borderRadius: 14,
          textAlign: "center",
          opacity: easeOutExpo(progress(frame, fps * 0.75, fps * 0.35)),
          transform: `translateY(${(1 - easeOutExpo(progress(frame, fps * 0.75, fps * 0.35))) * 12}px)`,
        }}
      >
        <span
          style={{
            fontSize: 28,
            color: accentColor,
            fontWeight: 700,
          }}
        >
          🔄 各ステップを自由に差し替えられる！
        </span>
      </div>
    </div>
  );
};
