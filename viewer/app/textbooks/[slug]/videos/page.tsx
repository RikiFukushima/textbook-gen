import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTextbook, getSlugsWithVideos, getTextbookVideoChapters } from "@/lib/content";
import TextbookVideoFeed from "@/components/TextbookVideoFeed";

export function generateStaticParams() {
  // 動画を 1 本でも持つ教材のみフィードページを生成する
  return getSlugsWithVideos().map((slug) => ({ slug }));
}

export default async function TextbookVideosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tb = getTextbook(slug);
  if (!tb) notFound();

  const groups = getTextbookVideoChapters(slug);
  if (groups.length === 0) notFound();

  return (
    <Suspense>
      <TextbookVideoFeed slug={slug} textbookTitle={tb.meta.title} groups={groups} />
    </Suspense>
  );
}
