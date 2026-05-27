import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import QuizViewer from "@/components/QuizViewer";

export function generateStaticParams() {
  const params: { slug: string; curriculum: string; chapter: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const cur of tb.curriculums) {
      for (const ch of cur.chapters) {
        if (ch.quiz && ch.quiz.questions.length > 0) {
          params.push({ slug, curriculum: cur.meta.id, chapter: ch.meta.id });
        }
      }
    }
  }
  return params;
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; curriculum: string; chapter: string }>;
}) {
  const { slug, curriculum, chapter } = await params;
  const tb = getTextbook(slug);
  const cur = tb?.curriculums.find((c) => c.meta.id === curriculum);
  const ch = cur?.chapters.find((c) => c.meta.id === chapter);
  if (!tb || !cur || !ch || !ch.quiz || ch.quiz.questions.length === 0) notFound();

  return (
    <QuizViewer
      slug={slug}
      curriculumId={cur.meta.id}
      chapterId={ch.meta.id}
      chapterTitle={`第${Number(ch.meta.id)}章 ${ch.meta.title}`}
      quiz={ch.quiz}
    />
  );
}
