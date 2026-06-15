"use client";
import Link from "next/link";
import { useState } from "react";
import type { Quiz, QuizOption } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import ChapterFab, { type ChapterRef } from "./ChapterFab";

interface Props {
  slug: string;
  curriculumId: string;
  chapterId: string;
  chapterTitle: string;
  quiz: Quiz;
  chapterList: ChapterRef[];
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizViewer({
  slug,
  curriculumId,
  chapterId,
  chapterTitle,
  quiz,
  chapterList,
}: Props) {
  const { recordAnswer } = useProgress(slug);
  const curriculumHref = `/textbooks/${slug}/${curriculumId}`;
  const chapterHref = `/textbooks/${slug}/${curriculumId}/${chapterId}`;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  // 各設問の選択肢順をマウント時に一度だけシャッフル
  const [shuffledOptions] = useState<QuizOption[][]>(() =>
    quiz.questions.map((q) => shuffle(q.options))
  );

  const total = quiz.questions.length;
  const q = quiz.questions[index];
  const options = shuffledOptions[index];

  function choose(optionId: string) {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    const correct = optionId === q.answer;
    if (correct) setCorrectCount((c) => c + 1);
    recordAnswer(`${curriculumId}:${q.id}`, optionId, correct);
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <main className="flex min-h-[100dvh] items-center justify-center px-5">
        <div className="surface-grad w-full max-w-md rounded-2xl border border-[var(--border)] p-8 text-center shadow-md">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-3 text-xl font-bold">{chapterTitle} 完了！</h1>
          <p className="mt-4 text-4xl font-bold">
            <span className="text-grad">
              {correctCount}/{total}
            </span>
            <span className="ml-2 text-base text-[var(--muted)]">正解（{pct}%）</span>
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={chapterHref}
              className="btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
            >
              復習する
            </Link>
            <Link
              href={curriculumHref}
              className="btn-accent rounded-lg px-4 py-2 text-sm font-medium"
            >
              章一覧へ →
            </Link>
          </div>
        </div>

        <ChapterFab
          slug={slug}
          curriculumId={curriculumId}
          chapterId={chapterId}
          chapterList={chapterList}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[var(--accent-weak)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <span className="min-w-0 flex-1 truncate text-sm font-bold">
          {chapterTitle}
        </span>
        <span className="shrink-0 text-xs text-[var(--muted)]">
          問 {index + 1} / {total}
        </span>
      </header>

      <div className="flex flex-1 items-start justify-center px-5 pt-8 pb-28">
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-bold leading-relaxed">{q.question}</h2>

          <ul className="mt-6 space-y-3">
            {options.map((opt, i) => {
              const isAnswer = opt.id === q.answer;
              const isSelected = opt.id === selected;
              let cls =
                "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]";
              if (revealed) {
                if (isAnswer)
                  cls = "border-green-500 bg-green-500/10";
                else if (isSelected)
                  cls = "border-red-500 bg-red-500/10";
                else cls = "border-[var(--border)] bg-[var(--card)] opacity-60";
              }
              return (
                <li key={opt.id}>
                  <button
                    onClick={() => choose(opt.id)}
                    disabled={revealed}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${cls}`}
                  >
                    <span className="font-mono text-sm text-[var(--muted)]">
                      {LETTERS[i] ?? String(i + 1)}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {revealed && (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-sm font-bold">
                {selected === q.answer ? "✅ 正解" : "❌ 不正解"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {q.explanation}
              </p>
            </div>
          )}

          {revealed && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={next}
                className="btn-accent rounded-lg px-5 py-2 text-sm font-medium"
              >
                {index + 1 >= total ? "結果を見る →" : "次の問題 →"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ChapterFab
        slug={slug}
        curriculumId={curriculumId}
        chapterId={chapterId}
        chapterList={chapterList}
      />
    </main>
  );
}
