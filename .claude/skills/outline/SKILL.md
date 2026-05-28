---
name: outline
description: 学習対象から教材の骨子(outline.yaml)を生成する。ユーザーが「〇〇の教材を作りたい」「△△の骨子を作って」「outline を作成して」など、新しい学習テーマから章立て・セクション分解を作りたいときに使う。対象テキストだけ、ローカルディレクトリ、URL/PDF などの外部ソースのいずれにも対応する。
---

# outline — 骨子生成

学習対象を受け取り、章立てとセクション分解を行って **1 つのカリキュラム**の骨子 `textbooks/{slug}/curriculums/{curriculum-id}/outline.yaml` を生成します。

階層は **教材(textbook) > カリキュラム(curriculum) > 章 > 節**。骨子はカリキュラム単位で作る。1 つの教材に複数カリキュラムを足す場合は、同じ `textbooks/{slug}/` の下に別の `curriculums/{id}/` を作る。

## 入力パターン

- **A. テキストだけ**(例: 「AWS SAA-C03 試験対策」)
- **B. ローカルディレクトリ**のパス(Read/Grep で内容を把握)
- **C. URL / PDF** などの外部ソース(WebFetch 等で取得)

B/C を使った場合は `meta.yaml` の `sources` に記録する。ローカル参照を含む場合は `contains_local_sources: true` を立てる。

## 処理フロー

1. **ヒアリング(対話的)**: 目的・想定読者(level / prerequisites)・到達目標を確認する。情報が足りなければ AskUserQuestion で補う。
2. **教材(textbook)とカリキュラム(curriculum)を確認**: 新規教材か、既存教材への 2 つ目以降のカリキュラム追加か。`slug`(教材)と `curriculum-id`(カリキュラム)を決める。
3. **雛形を作成**: ディレクトリと空テンプレート(meta.yaml / curriculum.yaml / outline.yaml)は **`init-textbook` スキル(= `npm run init-textbook -- <slug> [curriculum-id]`)で生成する**。確定的な雛形作成はスクリプトに一本化し、ここでは中身の設計に集中する。
4. **章立て案を提示**してユーザーレビューを受ける。
5. 各章を **12-25 分(目安 15 分)** の単位に分解し、その中で **3-5 セクション**に分割する。
6. 各セクションの `title` と `estimated_minutes`、扱う内容を提案する。
7. **中身を埋める**: 雛形の `outline.yaml`(章立て・セクション骨子)と `curriculum.yaml`(title, order, estimated_hours, chapter_order, target_audience)を編集する。新規教材なら `meta.yaml` の title/description/tags も整える(`init-textbook` は private 固定で生成する)。

## 出力スキーマ

`docs/outline-schema.md` を参照。要点:

- `target_audience`(level / prerequisites / estimated_hours)
- `style`(tone / code_examples / diagram_default)
- `chapters[]`: `id`, `title`, `estimated_minutes`, `learning_objectives[]`, `sections[]`(`id`, `title`, `estimated_minutes`), `diagrams[]`, `quiz`(count / difficulty)

## 制約

- 章の合計が curriculum の `estimated_hours` とおおむね整合すること。
- セクション数は章あたり 2-7(目安 3-5)。
- `slug`(教材)・`curriculum-id` は英小文字・数字・ハイフン。既存と同じ場合は更新として扱う(上書き方針)。
- 新しい教材に最初のカリキュラムを作るときも、必ず curriculum 層を挟む(`curriculums/{id}/` 直下に chapters を置く。教材直下に chapters を置かない)。

## 完了後

骨子は本文生成の入力にすぎない。本文は `chapter` skill、問題は `quiz` skill で生成する。
