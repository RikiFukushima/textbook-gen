import Link from "next/link";
import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import ChapterProgress from "@/components/ChapterProgress";
import BackLink from "@/components/BackLink";

export function generateStaticParams() {
  const params: { slug: string; curriculum: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const cur of tb.curriculums) {
      params.push({ slug, curriculum: cur.meta.id });
    }
  }
  return params;
}

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ slug: string; curriculum: string }>;
}) {
  const { slug, curriculum } = await params;
  const tb = getTextbook(slug);
  const cur = tb?.curriculums.find((c) => c.meta.id === curriculum);
  if (!tb || !cur) notFound();

  const allSectionIds = cur.chapters.flatMap((c) =>
    c.sections.map((s) => s.frontmatter.section_id)
  );
  const totalQuiz = cur.chapters.reduce(
    (n, c) => n + (c.quiz?.questions.length ?? 0),
    0
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <BackLink href={`/textbooks/${slug}`}>{tb.meta.title}</BackLink>

      <header className="mb-6 mt-4">
        <h1 className="text-grad inline-block text-3xl font-bold">{cur.meta.title}</h1>
        {cur.meta.description && (
          <p className="mt-2 text-sm text-[var(--muted)]">{cur.meta.description}</p>
        )}
        <ChapterProgress
          slug={slug}
          curriculumId={cur.meta.id}
          sectionIds={allSectionIds}
          totalQuiz={totalQuiz}
        />
      </header>

      <ol className="space-y-3">
        {cur.chapters.map((ch) => (
          <li
            key={ch.meta.id}
            className="card-accent rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6 shadow-sm"
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
                href={`/textbooks/${slug}/${cur.meta.id}/${ch.meta.id}`}
                className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
              >
                読む（{ch.sections.length} セクション）
              </Link>
              {ch.quiz && ch.quiz.questions.length > 0 && (
                <Link
                  href={`/textbooks/${slug}/${cur.meta.id}/${ch.meta.id}/quiz`}
                  className="btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
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
