import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTextbook, getVisibleSlugs } from "@/lib/content";
import VideoFeed from "@/components/VideoFeed";

export function generateStaticParams() {
  const params: { slug: string; curriculum: string; chapter: string }[] = [];
  for (const slug of getVisibleSlugs()) {
    const tb = getTextbook(slug);
    if (!tb) continue;
    for (const cur of tb.curriculums) {
      for (const ch of cur.chapters) {
        // 動画があるチャプターのみページを生成する
        if (ch.sections.some((s) => s.videoPath)) {
          params.push({ slug, curriculum: cur.meta.id, chapter: ch.meta.id });
        }
      }
    }
  }
  return params;
}

export default async function VideosPage({
  params,
}: {
  params: Promise<{ slug: string; curriculum: string; chapter: string }>;
}) {
  const { slug, curriculum, chapter } = await params;
  const tb = getTextbook(slug);
  const cur = tb?.curriculums.find((c) => c.meta.id === curriculum);
  const ch = cur?.chapters.find((c) => c.meta.id === chapter);
  if (!tb || !cur || !ch) notFound();

  return (
    <Suspense>
      <VideoFeed
        slug={slug}
        curriculumId={cur.meta.id}
        chapterId={ch.meta.id}
        chapterNumber={Number(ch.meta.id)}
        chapterTitle={ch.meta.title}
        sections={ch.sections}
      />
    </Suspense>
  );
}
