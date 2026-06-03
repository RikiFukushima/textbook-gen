"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Section } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import Markdown from "./Markdown";
import ChapterFab, { type ChapterRef } from "./ChapterFab";

interface Props {
  slug: string;
  curriculumId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  sections: Section[];
  estimatedMinutes?: number;
  hasQuiz: boolean;
  chapterList: ChapterRef[];
}

export default function SectionViewer({
  slug,
  curriculumId,
  chapterId,
  chapterNumber,
  chapterTitle,
  sections,
  estimatedMinutes,
  hasQuiz,
  chapterList,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { progress, markSectionComplete } = useProgress(slug);

  const curriculumHref = `/textbooks/${slug}/${curriculumId}`;
  const quizHref = `/textbooks/${slug}/${curriculumId}/${chapterId}/quiz`;
  const sectionCount = sections.length;
  const onBreak = index >= sectionCount;
  const qualify = (id: string) => `${curriculumId}:${id}`;

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const page = track.children[clamped] as HTMLElement;
    track.scrollTo({ left: page.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // 見開き(50%幅)でも正しく判定するため、実際のページ幅で割る
        const pageWidth =
          (track.firstElementChild as HTMLElement | null)?.offsetWidth ||
          track.clientWidth;
        const i = Math.round(track.scrollLeft / pageWidth);
        setIndex(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sec = sections[index];
    if (sec) markSectionComplete(qualify(sec.frontmatter.section_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, sections, markSectionComplete, curriculumId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const readCount = sections.filter((s) =>
    progress.completedSections.includes(qualify(s.frontmatter.section_id))
  ).length;

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm font-bold">
          <span className="text-[var(--muted)]">第{chapterNumber}章</span>
          <span className="ml-2">{chapterTitle}</span>
        </span>
        <span className="shrink-0 text-xs text-[var(--muted)]">
          {onBreak ? "読了" : `${index + 1} / ${sectionCount}`}
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

        <article className="swipe-page surface-grad">
          <div className="flex h-full items-center justify-center px-5">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
              <div className="text-5xl">📖</div>
              <h2 className="mt-4 text-xl font-bold">
                第{chapterNumber}章 読了！
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{chapterTitle}</p>

              <div className="mt-6 flex justify-center gap-6 text-sm">
                <span className="text-[var(--muted)]">
                  ✓ {readCount}/{sectionCount} セクション
                </span>
                {estimatedMinutes != null && (
                  <span className="text-[var(--muted)]">⏱ 約 {estimatedMinutes} 分</span>
                )}
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => goTo(0)}
                  className="btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
                >
                  最初から振り返る
                </button>
                {hasQuiz ? (
                  <Link
                    href={quizHref}
                    className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    クイズに挑戦 →
                  </Link>
                ) : (
                  <Link
                    href={curriculumHref}
                    className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    章一覧へ →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      <footer className="border-t border-[var(--border)] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {sections.map((sec, i) => {
              const done = progress.completedSections.includes(
                qualify(sec.frontmatter.section_id)
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
            <button
              aria-label="読了ページ"
              onClick={() => goTo(sectionCount)}
              className={`ml-0.5 text-xs leading-none transition-colors ${
                onBreak ? "text-[var(--accent)]" : "text-[var(--border)]"
              }`}
            >
              🏁
            </button>
          </div>

          {onBreak ? (
            hasQuiz ? (
              <Link
                href={quizHref}
                className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
              >
                クイズへ →
              </Link>
            ) : (
              <Link
                href={curriculumHref}
                className="btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
              >
                章一覧へ →
              </Link>
            )
          ) : (
            <button
              onClick={() => goTo(index + 1)}
              className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
            >
              {index === sectionCount - 1 ? "読了画面へ →" : "次へ →"}
            </button>
          )}
        </div>
      </footer>

      <ChapterFab
        slug={slug}
        curriculumId={curriculumId}
        chapterId={chapterId}
        chapterList={chapterList}
        bottomOffset="4.75rem"
      />
    </div>
  );
}
