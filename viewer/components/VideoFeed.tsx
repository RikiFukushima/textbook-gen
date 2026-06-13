"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Section } from "@/lib/types";

// Next.js の <video src> は basePath を自動付与しないため、
// 環境変数から basePath を取得して手動で補完する。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Props {
  slug: string;
  curriculumId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  sections: Section[];
  /** 動画を持つセクションだけ渡ってくる想定 */
  initialSectionIndex?: number;
}

export default function VideoFeed({
  slug,
  curriculumId,
  chapterId,
  chapterNumber,
  chapterTitle,
  sections,
  initialSectionIndex = 0,
}: Props) {
  const videoSections = sections.filter((s) => s.videoPath);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(
    Math.min(initialSectionIndex, Math.max(0, videoSections.length - 1))
  );
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const curriculumHref = `/textbooks/${slug}/${curriculumId}`;

  // スクロール位置からインデックスを同期
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const pageHeight =
          (track.firstElementChild as HTMLElement | null)?.offsetHeight ||
          track.clientHeight;
        const i = Math.round(track.scrollTop / pageHeight);
        setIndex(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // 現在のスライドの動画だけ再生し、他は一時停止
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.play().catch(() => {/* autoplay blocked は無視 */});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [index]);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const page = track.children[clamped] as HTMLElement;
    track.scrollTo({ top: page.offsetTop, behavior: "smooth" });
  }, []);

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(index + 1);
      if (e.key === "ArrowUp") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  if (videoSections.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-5">
        <p className="text-[var(--muted)]">この章には動画がまだありません。</p>
        <Link href={curriculumHref} className="btn-back">
          ← 章一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-black">
      {/* ヘッダー */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-4 py-3">
        <Link
          href={curriculumHref}
          className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          ← 章一覧
        </Link>
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/80">
          第{chapterNumber}章 {chapterTitle}
        </span>
        <span className="shrink-0 text-xs text-white/60">
          {index + 1} / {videoSections.length}
        </span>
      </header>

      {/* 縦スクロール動画トラック */}
      <div
        ref={trackRef}
        className="flex-1 overflow-y-auto"
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {videoSections.map((sec, i) => {
          // sections 配列内でのインデックスを求める（本文ページへのジャンプに使う）
          const sectionIndexInAll = sections.findIndex(
            (s) => s.frontmatter.section_id === sec.frontmatter.section_id
          );
          const readHref = `/textbooks/${slug}/${curriculumId}/${chapterId}/?section=${sectionIndexInAll}`;

          return (
            <div
              key={sec.frontmatter.section_id}
              style={{
                scrollSnapAlign: "start",
                flex: "0 0 100dvh",
                height: "100dvh",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
              }}
            >
              {/* 動画（basePath を手動付与: Next.js は <video> に basePath を自動付与しない） */}
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={sec.videoPath ? `${BASE_PATH}${sec.videoPath}` : undefined}
                playsInline
                loop
                muted={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#000",
                }}
              />

              {/* 右サイドバー（TikTokスタイル）*/}
              <div
                style={{
                  position: "absolute",
                  right: "max(1rem, env(safe-area-inset-right))",
                  bottom: "max(6rem, env(safe-area-inset-bottom))",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                {/* インジケーター */}
                <div className="flex flex-col gap-1.5">
                  {videoSections.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => goTo(dotIdx)}
                      aria-label={`動画 ${dotIdx + 1}`}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "9999px",
                        background: dotIdx === i ? "#fff" : "rgba(255,255,255,0.35)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 下部オーバーレイ：タイトル + 「本文を読む」 */}
              <div
                style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  padding: "max(1.5rem, env(safe-area-inset-bottom)) 1rem 1.5rem",
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                  zIndex: 10,
                }}
              >
                <p className="text-xs font-semibold text-white/60 mb-1">
                  {sec.frontmatter.order}. {sec.frontmatter.title}
                </p>
                {sec.frontmatter.learning_points && sec.frontmatter.learning_points.length > 0 && (
                  <p className="text-sm text-white/80 mb-3 line-clamp-2">
                    {sec.frontmatter.learning_points[0]}
                  </p>
                )}
                <Link
                  href={readHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--accent)] shadow-lg"
                >
                  📖 本文を読む
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
