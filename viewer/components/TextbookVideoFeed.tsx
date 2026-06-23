"use client";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { VideoChapterGroup } from "@/lib/types";

// Next.js の <video src> は basePath を自動付与しないため、
// 環境変数から basePath を取得して手動で補完する。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Props {
  slug: string;
  textbookTitle: string;
  groups: VideoChapterGroup[];
}

/** フィードに流す 1 本分の動画(章をまたいでフラット化したもの) */
interface FeedItem {
  key: string;
  curriculumId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  sectionId: string;
  order: number;
  title: string;
  firstLearningPoint?: string;
  videoPath: string;
  /** 章内でのセクション通し位置(本文ページの ?section= に使う) */
  sectionIndexInChapter: number;
}

export default function TextbookVideoFeed({ slug, textbookTitle, groups }: Props) {
  // 全章の動画をフラット化(章の並びは getTextbookVideoChapters の順序を保持)
  const allItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    for (const g of groups) {
      g.sections.forEach((sec, idx) => {
        if (!sec.videoPath) return;
        items.push({
          key: `${g.curriculumId}/${g.chapterId}/${sec.frontmatter.section_id}`,
          curriculumId: g.curriculumId,
          chapterId: g.chapterId,
          chapterNumber: g.chapterNumber,
          chapterTitle: g.chapterTitle,
          sectionId: sec.frontmatter.section_id,
          order: sec.frontmatter.order,
          title: sec.frontmatter.title,
          firstLearningPoint: sec.frontmatter.learning_points?.[0],
          videoPath: sec.videoPath,
          sectionIndexInChapter: idx,
        });
      });
    }
    return items;
  }, [groups]);

  // 章チップ用のユニークな章リスト(curriculumId+chapterId で一意化)
  const chapterChips = useMemo(
    () =>
      groups.map((g) => ({
        id: `${g.curriculumId}/${g.chapterId}`,
        number: g.chapterNumber,
        title: g.chapterTitle,
        count: g.sections.filter((s) => s.videoPath).length,
      })),
    [groups]
  );

  // null = すべての章。`${curriculumId}/${chapterId}` で 1 章に絞り込む。
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  const items = useMemo(
    () =>
      activeChapter === null
        ? allItems
        : allItems.filter((it) => `${it.curriculumId}/${it.chapterId}` === activeChapter),
    [allItems, activeChapter]
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

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
        if (!pageHeight) return;
        const i = Math.round(track.scrollTop / pageHeight);
        setIndex(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // 絞り込みが変わったら先頭に戻す
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollTo({ top: 0 });
    setIndex(0);
  }, [activeChapter]);

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
  }, [index, items]);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const page = track.children[clamped] as HTMLElement | undefined;
    if (page) track.scrollTo({ top: page.offsetTop, behavior: "smooth" });
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

  const textbookHref = `/textbooks/${slug}`;

  if (allItems.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-5">
        <p className="text-[var(--muted)]">この教材には動画がまだありません。</p>
        <Link href={textbookHref} className="btn-back">
          ← 教材へ戻る
        </Link>
      </div>
    );
  }

  const current = items[Math.min(index, items.length - 1)];

  return (
    <div className="flex h-[100dvh] flex-col bg-black">
      {/* ヘッダー：教材タイトル + 章チップ + 進捗 */}
      <header className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href={textbookHref}
            className="shrink-0 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
          >
            ← 教材
          </Link>
          <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/80">
            {textbookTitle}
          </span>
          <span className="shrink-0 text-xs text-white/60">
            {items.length > 0 ? `${Math.min(index, items.length - 1) + 1} / ${items.length}` : "0"}
          </span>
        </div>

        {/* 章フィルタチップ(横スクロール) */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          <ChapterChip
            active={activeChapter === null}
            label="すべて"
            count={allItems.length}
            onClick={() => setActiveChapter(null)}
          />
          {chapterChips.map((c) => (
            <ChapterChip
              key={c.id}
              active={activeChapter === c.id}
              label={`第${c.number}章`}
              count={c.count}
              onClick={() => setActiveChapter(c.id)}
            />
          ))}
        </div>
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
        {items.map((it, i) => {
          const readHref = `/textbooks/${slug}/${it.curriculumId}/${it.chapterId}/?section=${it.sectionIndexInChapter}`;
          return (
            <div
              key={it.key}
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
                src={`${BASE_PATH}${it.videoPath}`}
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

              {/* 右サイドバー：ドットインジケーター */}
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
                <div className="flex max-h-40 flex-col gap-1.5 overflow-hidden">
                  {items.map((_, dotIdx) => (
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

              {/* 下部オーバーレイ：章ラベル + タイトル + 「本文を読む」 */}
              <div
                style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  padding: "max(1.5rem, env(safe-area-inset-bottom)) 1rem 1.5rem",
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                  zIndex: 10,
                }}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                  第{it.chapterNumber}章 {it.chapterTitle}
                </p>
                <p className="mb-1 text-sm font-semibold text-white/80">
                  {it.order}. {it.title}
                </p>
                {it.firstLearningPoint && (
                  <p className="mb-3 line-clamp-2 text-sm text-white/70">
                    {it.firstLearningPoint}
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

        {/* 絞り込み結果が空(理論上は起きないが保険) */}
        {items.length === 0 && (
          <div className="flex h-[100dvh] items-center justify-center">
            <p className="text-white/60">この章には動画がありません。</p>
          </div>
        )}
      </div>

      {/* 現在地の章を控えめに表示(任意) */}
      {current && (
        <span className="sr-only">
          再生中: 第{current.chapterNumber}章 {current.title}
        </span>
      )}
    </div>
  );
}

function ChapterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors"
      style={{
        background: active ? "#fff" : "rgba(0,0,0,0.4)",
        color: active ? "#000" : "rgba(255,255,255,0.85)",
      }}
    >
      {label}
      <span style={{ opacity: 0.55, marginLeft: 4 }}>{count}</span>
    </button>
  );
}
