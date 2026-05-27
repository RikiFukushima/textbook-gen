"use client";
import Link from "next/link";
import { useState } from "react";
import type { Quiz } from "@/lib/types";
import { useProgress } from "@/lib/progress";

interface Props {
  slug: string;
  chapterId: string;
  chapterTitle: string;
  quiz: Quiz;
}

export default function QuizViewer({
  slug,
  chapterId,
  chapterTitle,
  quiz,
}: Props) {
  const { recordAnswer } = useProgress(slug);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const total = quiz.questions.length;
  const q = quiz.questions[index];

  function choose(optionId: string) {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    const correct = optionId === q.answer;
    if (correct) setCorrectCount((c) => c + 1);
    recordAnswer(q.id, optionId, correct);
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
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-3 text-xl font-bold">{chapterTitle} 完了！</h1>
          <p className="mt-4 text-3xl font-bold text-[var(--accent)]">
            {correctCount}/{total}
            <span className="ml-2 text-base text-[var(--muted)]">正解（{pct}%）</span>
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={`/textbooks/${slug}/${chapterId}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
            >
              復習する
            </Link>
            <Link
              href={`/textbooks/${slug}`}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              章一覧へ →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#12151c]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <Link
          href={`/textbooks/${slug}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
        >
          ← {chapterTitle}
        </Link>
        <span className="text-xs text-[var(--muted)]">
          問 {index + 1} / {total}
        </span>
      </header>

      <div className="flex flex-1 items-start justify-center px-5 py-8">
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-bold leading-relaxed">{q.question}</h2>

          <ul className="mt-6 space-y-3">
            {q.options.map((opt) => {
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
                      {opt.id.toUpperCase()}
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
                className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white"
              >
                {index + 1 >= total ? "結果を見る →" : "次の問題 →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
