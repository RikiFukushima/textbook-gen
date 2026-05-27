---
name: outline
description: 学習対象から教材の骨子(outline.yaml)を生成する。ユーザーが「〇〇の教材を作りたい」「△△の骨子を作って」「outline を作成して」など、新しい学習テーマから章立て・セクション分解を作りたいときに使う。対象テキストだけ、ローカルディレクトリ、URL/PDF などの外部ソースのいずれにも対応する。
---

# outline — 骨子生成

学習対象を受け取り、章立てとセクション分解を行って `textbooks/{slug}/outline.yaml` を生成します。

## 入力パターン

- **A. テキストだけ**(例: 「AWS SAA-C03 試験対策」)
- **B. ローカルディレクトリ**のパス(Read/Grep で内容を把握)
- **C. URL / PDF** などの外部ソース(WebFetch 等で取得)

B/C を使った場合は `meta.yaml` の `sources` に記録する。ローカル参照を含む場合は `contains_local_sources: true` を立てる。

## 処理フロー

1. **ヒアリング(対話的)**: 目的・想定読者(level / prerequisites)・到達目標を確認する。情報が足りなければ AskUserQuestion で補う。
2. **章立て案を提示**してユーザーレビューを受ける。
3. 各章を **12-25 分(目安 15 分)** の単位に分解し、その中で **3-5 セクション**に分割する。
4. 各セクションの `title` と `estimated_minutes`、扱う内容を提案する。
5. `slug` を決め、`textbooks/{slug}/` を作成して `meta.yaml` と `outline.yaml` を書き出す。

## 出力スキーマ

`docs/outline-schema.md` を参照。要点:

- `target_audience`(level / prerequisites / estimated_hours)
- `style`(tone / code_examples / diagram_default)
- `chapters[]`: `id`, `title`, `estimated_minutes`, `learning_objectives[]`, `sections[]`(`id`, `title`, `estimated_minutes`), `diagrams[]`, `quiz`(count / difficulty)

## 制約

- 章の合計が `estimated_hours` とおおむね整合すること。
- セクション数は章あたり 2-7(目安 3-5)。
- `slug` は英小文字・数字・ハイフン。既存 slug と同じ場合は同一教材の更新として扱う(上書き方針)。

## 完了後

骨子は本文生成の入力にすぎない。本文は `chapter` skill、問題は `quiz` skill で生成する。
