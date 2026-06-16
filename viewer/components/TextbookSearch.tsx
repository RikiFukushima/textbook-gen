"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TextbookSummary } from "@/lib/types";

interface Props {
  textbooks: TextbookSummary[];
}

export default function TextbookSearch({ textbooks }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 全教材のタグを重複排除して並べる(フィルタ用)。
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const tb of textbooks) {
      for (const tag of tb.meta.tags ?? []) set.add(tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [textbooks]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // タイトルワード(部分一致・大文字小文字無視)とタグ(選択タグをすべて含む = AND)で絞り込む。
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return textbooks.filter((tb) => {
      const matchesQuery = q === "" || tb.meta.title.toLowerCase().includes(q);
      const tags = tb.meta.tags ?? [];
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => tags.includes(t));
      return matchesQuery && matchesTags;
    });
  }, [textbooks, query, selectedTags]);

  return (
    <div>
      <div className="mb-6 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="タイトルで検索…"
          aria-label="タイトルで検索"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--code-bg)] text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="rounded-full px-2.5 py-1 text-xs text-[var(--muted)] underline-offset-2 hover:underline"
              >
                クリア
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--muted)]">
          条件に一致する教材が見つかりませんでした。
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((tb) => (
            <li key={tb.meta.slug}>
              <Link
                href={`/textbooks/${tb.meta.slug}`}
                className="card-accent block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6 shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold">{tb.meta.title}</h2>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {tb.curriculumCount} カリキュラム / {tb.chapterCount} 章
                  </span>
                </div>
                {tb.meta.description && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {tb.meta.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {tb.estimatedHours != null && (
                    <span className="rounded-full bg-[var(--code-bg)] px-2.5 py-1 text-xs text-[var(--muted)]">
                      約 {tb.estimatedHours} 時間
                    </span>
                  )}
                  {tb.meta.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--code-bg)] px-2.5 py-1 text-xs text-[var(--muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
