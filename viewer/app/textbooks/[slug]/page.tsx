import Link from "next/link";
import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";

export function generateStaticParams() {
  return getVisibleSlugs().map((slug) => ({ slug }));
}

export default async function TextbookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tb = getTextbook(slug);
  if (!tb) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
        ← 教材一覧
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="text-grad inline-block text-3xl font-bold">{tb.meta.title}</h1>
        {tb.meta.description && (
          <p className="mt-2 text-sm text-[var(--muted)]">{tb.meta.description}</p>
        )}
      </header>

      <h2 className="mb-3 text-sm font-bold text-[var(--muted)]">カリキュラム</h2>
      <ul className="space-y-3">
        {tb.curriculums.map((cur) => {
          const sectionCount = cur.chapters.reduce(
            (n, c) => n + c.sections.length,
            0
          );
          return (
            <li key={cur.meta.id}>
              <Link
                href={`/textbooks/${slug}/${cur.meta.id}`}
                className="card-accent block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6 shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-bold">{cur.meta.title}</h3>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {cur.chapters.length} 章 / {sectionCount} セクション
                  </span>
                </div>
                {cur.meta.description && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {cur.meta.description}
                  </p>
                )}
                {cur.meta.estimated_hours != null && (
                  <span className="mt-3 inline-block rounded-full bg-[var(--code-bg)] px-2.5 py-1 text-xs text-[var(--muted)]">
                    約 {cur.meta.estimated_hours} 時間
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
