import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, easeOutElastic, progress } from "../../easing";

type Props = { caption: string };

export const QuestHookScene: React.FC<Props> = ({ caption }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const blink = 0.7 + Math.sin((frame / fps) * Math.PI * 3) * 0.3;

  // 「?」ループアニメーション
  const qPulse = 0.95 + Math.sin((frame / fps) * Math.PI * 2) * 0.05;

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
      {/* 背景グロー: コーラル */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,74,0.15) 0%, rgba(0,210,200,0.08) 50%, transparent 80%)",
          opacity: easeOutExpo(progress(frame, 0, fps * 0.5)),
        }}
      />

      {/* 大きな「?」(問いで締める演出) */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 280,
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "3px rgba(255,107,74,0.5)",
          lineHeight: 1,
          transform: `scale(${easeOutElastic(progress(frame, fps * 0.05, fps * 0.6)) * qPulse})`,
          opacity: easeOutExpo(progress(frame, fps * 0.05, fps * 0.3)) * 0.8,
        }}
      >
        ?
      </div>

      {/* メインメッセージ */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 80,
          right: 80,
          textAlign: "center",
        }}
      >
        {/* 問いかけ */}
        <div
          style={{
            opacity: easeOutExpo(progress(frame, fps * 0.3, fps * 0.4)),
            transform: `translateY(${(1 - easeOutExpo(progress(frame, fps * 0.3, fps * 0.4))) * 20}px)`,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            あなたの RAG は
          </span>
        </div>
        <div
          style={{
            opacity: easeOutExpo(progress(frame, fps * 0.5, fps * 0.4)),
            transform: `translateY(${(1 - easeOutExpo(progress(frame, fps * 0.5, fps * 0.4))) * 20}px)`,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#ff6b4a",
              lineHeight: 1.2,
            }}
          >
            何型？
          </span>
        </div>

        {/* アンダーライン */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, transparent, #ff6b4a, transparent)",
            width: `${easeOutExpo(progress(frame, fps * 0.65, fps * 0.4)) * 100}%`,
            margin: "0 auto 48px",
            boxShadow: "0 0 10px rgba(255,107,74,0.4)",
          }}
        />

        {/* サブ */}
        <div
          style={{
            opacity: easeOutExpo(progress(frame, fps * 0.7, fps * 0.4)),
            transform: `translateY(${(1 - easeOutExpo(progress(frame, fps * 0.7, fps * 0.4))) * 16}px)`,
          }}
        >
          <span
            style={{
              fontSize: 46,
              color: "rgba(0,210,200,0.85)",
              fontWeight: 700,
            }}
          >
            {caption}
          </span>
        </div>
      </div>

      {/* CTA ボタン */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "center",
          opacity: easeOutBack(progress(frame, fps * 0.9, fps * 0.4)) * blink,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff6b4a, #ff8c42)",
            borderRadius: 999,
            padding: "28px 80px",
            boxShadow: "0 0 32px rgba(255,107,74,0.4), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "0.05em",
            }}
          >
            本文で確かめる →
          </span>
        </div>
      </div>

      {/* 下部: 完了表示 */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: easeOutExpo(progress(frame, fps * 0.95, fps * 0.35)) * 0.5,
        }}
      >
        <span
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
          }}
        >
          05 / 05  ·  COMPLETE
        </span>
      </div>
    </div>
  );
};
