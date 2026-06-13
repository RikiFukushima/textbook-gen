import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, easeOutElastic, progress } from "../../easing";

type Props = { caption: string };

export const QuestHookScene: React.FC<Props> = ({ caption }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // blink は Math.sin を使うが Remotion では問題ない（frame ベース）
  const blink = 0.7 + Math.sin((frame / fps) * Math.PI * 3) * 0.3;

  // 「?」ループ
  const qPulse = 0.95 + Math.sin((frame / fps) * Math.PI * 2) * 0.05;

  // 背景グロー
  const glowP = easeOutExpo(progress(frame, 0, fps * 0.5));

  // 「?」スケールイン
  const qScale = easeOutElastic(progress(frame, fps * 0.05, fps * 0.6));
  const qOpacity = easeOutExpo(progress(frame, fps * 0.05, fps * 0.3));

  // メインメッセージ
  const msg1P = easeOutExpo(progress(frame, fps * 0.3, fps * 0.4));
  const msg2P = easeOutExpo(progress(frame, fps * 0.5, fps * 0.4));

  // アンダーライン
  const lineP = easeOutExpo(progress(frame, fps * 0.65, fps * 0.4));

  // caption
  const captionP = easeOutExpo(progress(frame, fps * 0.7, fps * 0.4));

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background:
          "linear-gradient(135deg, #1a1a4e 0%, #0d1b69 30%, #1e0a4a 70%, #0a1628 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Hiragino Sans", sans-serif',
      }}
    >
      {/* 背景グロー: 中央 */}
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
            "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(167,139,250,0.08) 50%, transparent 80%)",
          opacity: glowP,
        }}
      />

      {/* 右下グロー */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
          opacity: glowP,
        }}
      />

      {/* 大きな「?」 */}
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
          WebkitTextStroke: "3px rgba(56,189,248,0.4)",
          lineHeight: 1,
          transform: `scale(${qScale * qPulse})`,
          opacity: qOpacity * 0.8,
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
        {/* 問いかけ 1行目 */}
        <div
          style={{
            opacity: msg1P,
            transform: `translateY(${(1 - msg1P) * 20}px)`,
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

        {/* 問いかけ 2行目 */}
        <div
          style={{
            opacity: msg2P,
            transform: `translateY(${(1 - msg2P) * 20}px)`,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#38bdf8",
              lineHeight: 1.2,
              textShadow: "0 0 30px rgba(56,189,248,0.5)",
            }}
          >
            何型？
          </span>
        </div>

        {/* アンダーライン */}
        <div
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, transparent, #38bdf8, #a78bfa, transparent)",
            width: `${lineP * 100}%`,
            margin: "0 auto 48px",
            boxShadow: "0 0 12px rgba(56,189,248,0.4)",
          }}
        />

        {/* caption */}
        <div
          style={{
            opacity: captionP,
            transform: `translateY(${(1 - captionP) * 16}px)`,
          }}
        >
          <span
            style={{
              fontSize: 46,
              color: "rgba(167,139,250,0.9)",
              fontWeight: 700,
            }}
          >
            {caption}
          </span>
        </div>
      </div>

      {/* CTA ボタン: グラスモーフィズム */}
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
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            backdropFilter: "blur(20px)",
            borderRadius: 999,
            padding: "28px 80px",
            boxShadow:
              "0 0 40px rgba(56,189,248,0.35), 0 8px 24px rgba(0,0,0,0.3)",
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
          COMPLETE
        </span>
      </div>
    </div>
  );
};
