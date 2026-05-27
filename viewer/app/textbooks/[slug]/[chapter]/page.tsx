import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import SectionViewer from "@/components/SectionViewer";

export function generateStaticParams() {
  const params: { slug: string; chapter: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const ch of tb.chapters) {
      params.push({ slug, chapter: ch.meta.id });
    }
  }
  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const tb = getTextbook(slug);
  const ch = tb?.chapters.find((c) => c.meta.id === chapter);
  if (!tb || !ch) notFound();

  return (
    <SectionViewer
      slug={slug}
      chapterId={ch.meta.id}
      chapterNumber={Number(ch.meta.id)}
      chapterTitle={ch.meta.title}
      sections={ch.sections}
      estimatedMinutes={ch.meta.estimated_minutes}
      hasQuiz={!!ch.quiz && ch.quiz.questions.length > 0}
    />
  );
}
