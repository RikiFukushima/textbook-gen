import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import QuizViewer from "@/components/QuizViewer";

export function generateStaticParams() {
  const params: { slug: string; chapter: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const ch of tb.chapters) {
      if (ch.quiz && ch.quiz.questions.length > 0) {
        params.push({ slug, chapter: ch.meta.id });
      }
    }
  }
  return params;
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const tb = getTextbook(slug);
  const ch = tb?.chapters.find((c) => c.meta.id === chapter);
  if (!tb || !ch || !ch.quiz || ch.quiz.questions.length === 0) notFound();

  return (
    <QuizViewer
      slug={slug}
      chapterId={ch.meta.id}
      chapterTitle={`第${Number(ch.meta.id)}章 ${ch.meta.title}`}
      quiz={ch.quiz}
    />
  );
}
