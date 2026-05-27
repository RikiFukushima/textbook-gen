import Link from "next/link";
import { getTextbookSummaries } from "@/lib/content";

export default function Home() {
  const textbooks = getTextbookSummaries();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">教材一覧</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          自動生成された教材を選んで学習を始めましょう。
        </p>
      </header>

      {textbooks.length === 0 ? (
        <p className="text-[var(--muted)]">
          一覧に表示する教材はまだありません(unlisted の教材は直接リンクからアクセスできます)。
        </p>
      ) : (
        <ul className="space-y-3">
          {textbooks.map((tb) => (
            <li key={tb.meta.slug}>
              <Link
                href={`/textbooks/${tb.meta.slug}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--accent)]"
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
    </main>
  );
}
