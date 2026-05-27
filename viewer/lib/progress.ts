"use client";
import { useCallback, useEffect, useState } from "react";

// localStorage に保存する進捗(Supabase 導入までの暫定)。
// キー: tg:progress:{slug}
interface TextbookProgress {
  completedSections: string[]; // section_id
  quizAnswers: Record<string, { selected: string; correct: boolean }>; // question_id -> 回答
}

const empty: TextbookProgress = { completedSections: [], quizAnswers: {} };

function storageKey(slug: string): string {
  return `tg:progress:${slug}`;
}

function read(slug: string): TextbookProgress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as TextbookProgress) };
  } catch {
    return empty;
  }
}

function write(slug: string, data: TextbookProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(slug), JSON.stringify(data));
}

export function useProgress(slug: string) {
  const [progress, setProgress] = useState<TextbookProgress>(empty);

  useEffect(() => {
    setProgress(read(slug));
  }, [slug]);

  const markSectionComplete = useCallback(
    (sectionId: string) => {
      setProgress((prev) => {
        if (prev.completedSections.includes(sectionId)) return prev;
        const next = {
          ...prev,
          completedSections: [...prev.completedSections, sectionId],
        };
        write(slug, next);
        return next;
      });
    },
    [slug]
  );

  const recordAnswer = useCallback(
    (questionId: string, selected: string, correct: boolean) => {
      setProgress((prev) => {
        const next = {
          ...prev,
          quizAnswers: {
            ...prev.quizAnswers,
            [questionId]: { selected, correct },
          },
        };
        write(slug, next);
        return next;
      });
    },
    [slug]
  );

  return { progress, markSectionComplete, recordAnswer };
}
