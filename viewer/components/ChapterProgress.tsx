"use client";
import { useProgress } from "@/lib/progress";

export default function ChapterProgress({
  slug,
  curriculumId,
  sectionIds,
  totalQuiz,
}: {
  slug: string;
  curriculumId: string;
  sectionIds: string[];
  totalQuiz: number;
}) {
  const { progress } = useProgress(slug);

  const qualified = sectionIds.map((id) => `${curriculumId}:${id}`);
  const doneSections = qualified.filter((id) =>
    progress.completedSections.includes(id)
  ).length;

  const answered = Object.keys(progress.quizAnswers).filter((k) =>
    k.startsWith(`${curriculumId}:`)
  ).length;
  const correct = Object.entries(progress.quizAnswers).filter(
    ([k, v]) => k.startsWith(`${curriculumId}:`) && v.correct
  ).length;

  const pct =
    sectionIds.length === 0
      ? 0
      : Math.round((doneSections / sectionIds.length) * 100);

  return (
    <div className="mt-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="progress-grad h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-[var(--muted)]">
        <span>
          セクション {doneSections}/{sectionIds.length}
        </span>
        {totalQuiz > 0 && answered > 0 && (
          <span>
            クイズ正答 {correct}/{answered}
          </span>
        )}
      </div>
    </div>
  );
}
