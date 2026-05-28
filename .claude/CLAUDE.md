# Textbook Generator — プロジェクト方針

任意の学習対象から、教材(Markdown)と理解度確認問題(4 択)を自動生成するプロジェクトです。生成物は `textbooks/{slug}/` 配下に出力し、Next.js ビューワで閲覧・演習します。

要件の全体像は `../docs/textbook-gen-spec.md`、教材スキーマの詳細は `../docs/outline-schema.md` を参照してください。

## 階層(必ず守る)

```
教材(Textbook) ─ カリキュラム(Curriculum) ─ 章(Chapter) ─ セクション/クイズ
```

- **textbook : curriculum = 1 : 多**。生成・閲覧・進捗はすべて curriculum 配下で完結する。
- **1 セクション = 1 ページ = 1 学習ユニット**(マイクロラーニング指向)。
- 生成物の配置: `textbooks/{slug}/curriculums/{curriculum-id}/{outline.yaml, chapters/, quizzes/}`。

## skill / agent の役割分担

| 用途 | 入口 | 実体 |
| --- | --- | --- |
| 教材・カリキュラム雛形 | `init-textbook` skill | `scripts/init-textbook.ts`(決定論的) |
| 骨子(章・節)の設計 | `outline` skill | main で実行 |
| 章本文の執筆 | `chapter` skill(オーケストレータ) | **`chapter-writer` agent を並列起動** |
| クイズ生成 | `quiz` skill(オーケストレータ) | **`quiz-writer` agent を並列起動** |
| レビュー | `reviewer` agent | 指摘レポートのみ(自動修正しない) |

## 執筆規約の正本

**`.claude/skills/textbook-style/SKILL.md`** がすべての執筆・レビュールールの単一の正本(Single Source of Truth)です。次の内容を含みます:

- 階層と粒度 / ディレクトリ配置 / 命名規則
- メタ情報の正本(source of truth)テーブル
- セクション本文の frontmatter / 3 層構造 / 字数ルール(例外含む)/ トーン / Mermaid 使い分け
- クイズのスキーマ / distractor 戦略 / source_refs ルール
- レビュー観点(本文・クイズ)
- 安全(visibility / contains_local_sources)

**ルールを変更するときは textbook-style だけを編集する**(他の skill / agent に同じ規約を二重に書かない)。chapter-writer / quiz-writer / reviewer は frontmatter の `skills: [textbook-style]` で起動時にこの内容を **プリロード(全文がコンテキストに注入される)** ので、agent 起動の度に内容が同期される。

## 生成フロー(典型)

1. `init-textbook` で雛形を作る。
2. `outline` で骨子を埋める(対話・レビューを挟む)。
3. `chapter` で本文を生成 → 章を並列で `chapter-writer` に流す。
4. `quiz` でクイズを生成 → 章を並列で `quiz-writer` に流す。
5. 必要に応じて `reviewer` を回し、指摘箇所だけ該当 skill を再実行。

## 安全(リマインダー)

- ローカルディレクトリ参照を含む教材は `meta.yaml` に `contains_local_sources: true`。
- `visibility` を勝手に `public` にしない(既定 `private`)。
- 詳細は textbook-style §7。
