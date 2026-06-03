"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloseIcon,
  ListIcon,
} from "./BackLink";

export interface ChapterRef {
  id: string;
  number: number;
  title: string;
}

interface Props {
  slug: string;
  curriculumId: string;
  chapterId: string;
  chapterList: ChapterRef[];
  /** ボタン下端のオフセット(右下の他UIと重なるとき指定。例: "4.75rem") */
  bottomOffset?: string;
}

export default function ChapterFab({
  slug,
  curriculumId,
  chapterId,
  chapterList,
  bottomOffset,
}: Props) {
  const [open, setOpen] = useState(false);

  const curriculumHref = `/textbooks/${slug}/${curriculumId}`;
  const chapterHref = (id: string) => `/textbooks/${slug}/${curriculumId}/${id}`;

  const currentIndex = chapterList.findIndex((c) => c.id === chapterId);
  const current = currentIndex >= 0 ? chapterList[currentIndex] : null;
  const prev = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < chapterList.length - 1
      ? chapterList[currentIndex + 1]
      : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="章ナビゲーションを開く"
          className="fab"
          style={
            bottomOffset
              ? {
                  bottom: `calc(${bottomOffset} + env(safe-area-inset-bottom))`,
                }
              : undefined
          }
        >
          <ListIcon size={16} />
          <span className="leading-none">
            第{current?.number ?? "?"}章
          </span>
          <ChevronUp size={14} />
        </button>
      )}

      {open && (
        <>
          <div
            className="fab-overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="章ナビゲーション"
            className="fab-sheet"
            style={
              bottomOffset
                ? {
                    bottom: `calc(${bottomOffset} + env(safe-area-inset-bottom))`,
                  }
                : undefined
            }
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="text-sm font-bold">章を選ぶ</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="btn-icon"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex gap-2 px-3 pt-3">
              {prev ? (
                <Link
                  href={chapterHref(prev.id)}
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left"
                >
                  <ChevronLeft />
                  <span className="min-w-0">
                    <span className="block text-[10px] text-[var(--muted)]">
                      前の章
                    </span>
                    <span className="block truncate text-xs font-medium">
                      第{prev.number}章
                    </span>
                  </span>
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--border)]"
                >
                  <ChevronLeft />
                  <span className="block text-[10px]">前の章はありません</span>
                </span>
              )}
              {next ? (
                <Link
                  href={chapterHref(next.id)}
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex flex-1 items-center justify-end gap-2 rounded-lg px-3 py-2 text-right"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] text-[var(--muted)]">
                      次の章
                    </span>
                    <span className="block truncate text-xs font-medium">
                      第{next.number}章
                    </span>
                  </span>
                  <ChevronRight />
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex flex-1 items-center justify-end gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--border)]"
                >
                  <span className="block text-[10px]">次の章はありません</span>
                  <ChevronRight />
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              <ul className="space-y-0.5">
                {chapterList.map((c) => {
                  const isCurrent = c.id === chapterId;
                  return (
                    <li key={c.id}>
                      <Link
                        href={chapterHref(c.id)}
                        onClick={() => setOpen(false)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isCurrent
                            ? "bg-[var(--accent-weak)] font-bold text-[var(--accent)]"
                            : "hover:bg-[var(--accent-weak)]/60 text-[var(--fg)]"
                        }`}
                      >
                        <span
                          className={`w-12 shrink-0 font-mono text-xs ${
                            isCurrent
                              ? "text-[var(--accent)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          第{c.number}章
                        </span>
                        <span className="min-w-0 truncate">{c.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-[var(--border)] px-3 py-3">
              <Link
                href={curriculumHref}
                onClick={() => setOpen(false)}
                className="btn-ghost block w-full rounded-lg px-3 py-2 text-center text-sm font-medium"
              >
                章一覧へ戻る
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
