import Link from "next/link";
import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import ChapterProgress from "@/components/ChapterProgress";

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

  const allSectionIds = tb.chapters.flatMap((c) =>
    c.sections.map((s) => s.frontmatter.section_id)
  );
  const totalQuiz = tb.chapters.reduce(
    (n, c) => n + (c.quiz?.questions.length ?? 0),
    0
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
        ← 教材一覧
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-bold">{tb.meta.title}</h1>
        {tb.meta.description && (
          <p className="mt-2 text-sm text-[var(--muted)]">{tb.meta.description}</p>
        )}
        <ChapterProgress
          slug={slug}
          sectionIds={allSectionIds}
          totalQuiz={totalQuiz}
        />
      </header>

      <ol className="space-y-3">
        {tb.chapters.map((ch) => (
          <li
            key={ch.meta.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold">
                第{Number(ch.meta.id)}章 {ch.meta.title}
              </h2>
              <span className="shrink-0 text-xs text-[var(--muted)]">
                {ch.meta.estimated_minutes != null
                  ? `約 ${ch.meta.estimated_minutes} 分`
                  : ""}
              </span>
            </div>

            {ch.meta.learning_objectives && (
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                {ch.meta.learning_objectives.map((o, i) => (
                  <li key={i} className="list-disc list-inside">
                    {o}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex gap-3">
              <Link
                href={`/textbooks/${slug}/${ch.meta.id}`}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
              >
                読む（{ch.sections.length} セクション）
              </Link>
              {ch.quiz && ch.quiz.questions.length > 0 && (
                <Link
                  href={`/textbooks/${slug}/${ch.meta.id}/quiz`}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
                >
                  クイズ（{ch.quiz.questions.length} 問）
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
