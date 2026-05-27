"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Section } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import Markdown from "./Markdown";

interface Props {
  slug: string;
  chapterId: string;
  chapterTitle: string;
  sections: Section[];
  hasQuiz: boolean;
}

export default function SectionViewer({
  slug,
  chapterId,
  chapterTitle,
  sections,
  hasQuiz,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { progress, markSectionComplete } = useProgress(slug);

  const total = sections.length;

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const page = track.children[clamped] as HTMLElement;
    track.scrollTo({ left: page.offsetLeft, behavior: "smooth" });
  }, []);

  // スクロール位置から現在のセクションを判定
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setIndex(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // 表示中セクションを完了として記録
  useEffect(() => {
    const sec = sections[index];
    if (sec) markSectionComplete(sec.frontmatter.section_id);
  }, [index, sections, markSectionComplete]);

  // PC: 矢印キーで移動
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const isLast = index === total - 1;

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <Link
          href={`/textbooks/${slug}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
        >
          ← {chapterTitle}
        </Link>
        <span className="text-xs text-[var(--muted)]">
          {index + 1} / {total}
        </span>
      </header>

      <div ref={trackRef} className="swipe-track flex-1">
        {sections.map((sec) => (
          <article key={sec.frontmatter.section_id} className="swipe-page">
            <div className="mx-auto max-w-2xl px-5 py-8">
              <Markdown content={sec.content} />
            </div>
          </article>
        ))}
      </div>

      <footer className="border-t border-[var(--border)] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex gap-1.5">
            {sections.map((sec, i) => {
              const done = progress.completedSections.includes(
                sec.frontmatter.section_id
              );
              return (
                <button
                  key={sec.frontmatter.section_id}
                  aria-label={`セクション ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === index
                      ? "bg-[var(--accent)]"
                      : done
                        ? "bg-[var(--muted)]"
                        : "bg-[var(--border)]"
                  }`}
                />
              );
            })}
          </div>

          {isLast ? (
            hasQuiz ? (
              <Link
                href={`/textbooks/${slug}/${chapterId}/quiz`}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
              >
                クイズへ →
              </Link>
            ) : (
              <Link
                href={`/textbooks/${slug}`}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
              >
                章一覧へ →
              </Link>
            )
          ) : (
            <button
              onClick={() => goTo(index + 1)}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              次へ →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
