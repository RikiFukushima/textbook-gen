---
name: quiz
description: 1 章分のセクション群から 4 択の理解度確認問題(JSON)を生成する。ユーザーが「第〇章のクイズを作って」「問題を生成して」「4 択問題を作成して」など、章本文から演習問題を作りたいときに使う。
---

# quiz — 4 択問題生成

ある章のセクション群(`chapters/{chapter-id}/sections/*.md`)を読み、`textbooks/{slug}/quizzes/{chapter-id}.json` を生成します。

## 出力スキーマ

```json
{
  "chapter_id": "01",
  "questions": [
    {
      "id": "q01-01",
      "question": "...",
      "options": [
        { "id": "a", "text": "..." },
        { "id": "b", "text": "..." },
        { "id": "c", "text": "..." },
        { "id": "d", "text": "..." }
      ],
      "answer": "d",
      "explanation": "...",
      "source_refs": [{ "section_id": "01-01", "anchor": "5 つの柱" }],
      "difficulty": "easy",
      "tags": ["waf", "basics"]
    }
  ]
}
```

- 問題数・難易度は `outline.yaml` の章 `quiz`(count / difficulty)に従う。
- `id` は `q{chapter_id}-{連番}`。

## Distractor 戦略

- 初学者が混同しやすい概念を誤答に選ぶ。
- 「**ほぼ正解だが部分的に違う**」選択肢を **1 つは入れる**。
- 完全にランダム・無関係な誤答は不可。
- 選択肢の長さ・粒度を揃え、正解だけ目立たないようにする。

## source_refs

各問題に根拠セクションを `section_id` + anchor(本文見出しや語句)で必ず紐づける。将来の RAG 引用にも使う。

## 自己レビュー

生成後に reviewer agent で「**正解が本当に 1 つだけか**」「**根拠が本文にあるか**」を確認する。reviewer は指摘のみ返すため、問題があれば quiz skill を再実行して修正する。
