import { notFound } from "next/navigation";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import SectionViewer from "@/components/SectionViewer";

export function generateStaticParams() {
  const params: { slug: string; curriculum: string; chapter: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const cur of tb.curriculums) {
      for (const ch of cur.chapters) {
        params.push({ slug, curriculum: cur.meta.id, chapter: ch.meta.id });
      }
    }
  }
  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; curriculum: string; chapter: string }>;
}) {
  const { slug, curriculum, chapter } = await params;
  const tb = getTextbook(slug);
  const cur = tb?.curriculums.find((c) => c.meta.id === curriculum);
  const ch = cur?.chapters.find((c) => c.meta.id === chapter);
  if (!tb || !cur || !ch) notFound();

  const chapterList = cur.chapters.map((c) => ({
    id: c.meta.id,
    number: Number(c.meta.id),
    title: c.meta.title,
  }));

  return (
    <SectionViewer
      slug={slug}
      curriculumId={cur.meta.id}
      chapterId={ch.meta.id}
      chapterNumber={Number(ch.meta.id)}
      chapterTitle={ch.meta.title}
      sections={ch.sections}
      estimatedMinutes={ch.meta.estimated_minutes}
      hasQuiz={!!ch.quiz && ch.quiz.questions.length > 0}
      chapterList={chapterList}
    />
  );
}
