import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, progress } from "../../easing";
import { SlideData } from "../../types";
import { BulletsSlide } from "../../slides/BulletsSlide";
import { CompareSlide } from "../../slides/CompareSlide";
import { StepsSlide } from "../../slides/StepsSlide";
import { KeywordSlide } from "../../slides/KeywordSlide";

type Props = {
  label: string;
  caption: string;
  slide?: SlideData;
  index: number;
  total: number;
};

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

// シーンごとのアクセントカラー
const ACCENT_COLORS = ["#38bdf8", "#a78bfa", "#34d399"];

export const QuestPointScene: React.FC<Props> = ({
  label,
  caption,
  slide,
  index,
  total,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  // プログレスバーの幅
  const progressW = ((index + 1) / total) * 100;

  const lines = caption.split("\n");
  const hasSlide = slide !== undefined;

  // 背景グロー opacity
  const glowP = easeOutExpo(progress(frame, 0, fps * 0.5));

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 背景グロー */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
          opacity: glowP,
          pointerEvents: "none",
        }}
      />

      {/* ━━ 上部固定ゾーン: プログレスバー + ラベル ━━ */}
      {/* プログレスバー */}
      <div
        style={{
          flexShrink: 0,
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

      {/* ラベルバー */}
      <div
        style={{
          flexShrink: 0,
          paddingTop: 40,
          paddingLeft: 64,
          paddingBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
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
            boxShadow: `0 0 14px ${accent}88`,
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

      {/* ━━ メインコンテンツ: キャプション + スライドをflexで縦積み ━━ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingLeft: 64,
          paddingRight: 64,
          paddingBottom: 64,
          gap: 24,
          minHeight: 0,
        }}
      >
        {/* キャプション */}
        <div style={{ flexShrink: 0 }}>
          {lines.map((line, i) => {
            const maxW = 952;
            // スライドあり: キャプションは小さめにしてスライドに余白を与える
            const baseSize = hasSlide ? 60 : 96;
            const calcSize =
              line.length > 0
                ? Math.min(baseSize, Math.floor(maxW / line.length / 0.9))
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
                style={{ marginBottom: 2 }}
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
              marginTop: 12,
              boxShadow: `0 0 8px ${accent}66`,
            }}
          />
        </div>

        {/* スライドエリア: flex:1でキャプション以外の残りを使う */}
        {hasSlide && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              opacity: easeOutExpo(progress(frame, fps * 0.35, fps * 0.35)),
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {slide.kind === "bullets" && <BulletsSlide data={slide} />}
            {slide.kind === "compare" && <CompareSlide data={slide} />}
            {slide.kind === "steps" && <StepsSlide data={slide} />}
            {slide.kind === "keyword" && <KeywordSlide data={slide} />}
          </div>
        )}
      </div>

      {/* 進捗テキスト */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          right: 72,
          color: "rgba(255,255,255,0.2)",
          fontSize: 24,
          letterSpacing: "0.15em",
          opacity: easeOutExpo(progress(frame, fps * 0.8, fps * 0.3)),
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
};
