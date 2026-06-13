import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutBack, easeOutElastic, progress } from "../../easing";

type Props = { caption: string };

// 1行ずつスパンで出現するテキスト
function RevealText({
  text,
  fontSize,
  color,
  startFrame,
  duration,
  style,
}: {
  text: string;
  fontSize: number;
  color: string;
  startFrame: number;
  duration: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, duration));
  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
        fontWeight: 800,
        lineHeight: 1.3,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

export const QuestCoverScene: React.FC<Props> = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // 大きな「?」のアニメーション
  const qScale = easeOutElastic(progress(frame, 0, fps * 0.7));
  const qOpacity = easeOutExpo(progress(frame, 0, fps * 0.35));

  // 背景グロー
  const glowOpacity = easeOutExpo(progress(frame, fps * 0.2, fps * 0.6));

  // ラベルバー
  const labelP = easeOutExpo(progress(frame, fps * 0.3, fps * 0.35));

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
          top: 600,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,74,0.18) 0%, rgba(255,107,74,0.04) 60%, transparent 80%)",
          opacity: glowOpacity,
        }}
      />

      {/* 背景グロー: ティール */}
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,210,200,0.12) 0%, transparent 70%)",
          opacity: glowOpacity,
        }}
      />

      {/* 大きな「?」 */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 360,
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "3px rgba(255,107,74,0.35)",
          lineHeight: 1,
          transform: `scale(${0.3 + qScale * 0.7})`,
          opacity: qOpacity * 0.6,
          userSelect: "none",
        }}
      >
        ?
      </div>

      {/* ラベルバー */}
      <div
        style={{
          position: "absolute",
          top: 240,
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
            background: "#ff6b4a",
            borderRadius: 3,
            boxShadow: "0 0 12px rgba(255,107,74,0.6)",
          }}
        />
        <span
          style={{
            fontSize: 28,
            color: "#ff6b4a",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          LESSON 01
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
        <RevealText
          text="RAGが遅い理由、"
          fontSize={96}
          color="#ffffff"
          startFrame={fps * 0.5}
          duration={fps * 0.4}
          style={{ marginBottom: 8 }}
        />
        <RevealText
          text="知ってる？"
          fontSize={96}
          color="#ff6b4a"
          startFrame={fps * 0.75}
          duration={fps * 0.4}
          style={{ marginBottom: 48 }}
        />

        {/* アンダーライン */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #ff6b4a, transparent)",
            width: `${easeOutExpo(progress(frame, fps * 0.9, fps * 0.4)) * 100}%`,
            borderRadius: 2,
            marginBottom: 48,
            boxShadow: "0 0 10px rgba(255,107,74,0.4)",
          }}
        />

        <RevealText
          text="実は LlamaIndex が解いてる問題は"
          fontSize={46}
          color="rgba(255,255,255,0.65)"
          startFrame={fps * 1.0}
          duration={fps * 0.4}
          style={{ marginBottom: 8, fontWeight: 400 }}
        />
        <RevealText
          text="LLM じゃなくて「索引設計」だった。"
          fontSize={46}
          color="rgba(0,210,200,0.9)"
          startFrame={fps * 1.25}
          duration={fps * 0.4}
          style={{ fontWeight: 700 }}
        />
      </div>

      {/* 下部: ページ番号 */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          color: "rgba(255,255,255,0.25)",
          fontSize: 26,
          letterSpacing: "0.15em",
          opacity: easeOutExpo(progress(frame, fps * 1.4, fps * 0.3)),
        }}
      >
        01 / 05
      </div>
    </div>
  );
};
