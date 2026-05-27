# Textbook Generator — プロジェクト方針

任意の学習対象から、教材(Markdown)と理解度確認問題(4 択)を自動生成するプロジェクトです。生成物は `textbooks/{slug}/` 配下に出力し、Next.js ビューワで閲覧・演習します。

要件の全体像は `../docs/textbook-gen-spec.md` を参照してください(このファイルは生成時に守る要点の抜粋です)。

## 生成の基本単位

```
教材(Textbook)              最上位の保管単位(例:「Git」)
  └─ カリキュラム(Curriculum) 学習コース(例:「Git の基礎」)。1 教材に複数可
      └─ 章(Chapter)         12-25 分(目安 15 分 / 3-5 セクション)
          ├─ セクション × N    3-5 分 / 1500-2000 字(下限 1200・上限 3000)
          │                    ※字数は地の文+見出しで計測。コード2つ以上は下限 800 字に緩和
          └─ クイズ            4 択 × N
```

- **textbook : curriculum = 1 : 多**。生成・閲覧・進捗はすべて curriculum 配下で完結する。
- **1 セクション = 1 ページ = 1 学習ユニット**。マイクロラーニング指向。
- セクション本文は「概念 → 具体例 → 注意点」の 3 層構造を基本とする。
- 生成物の配置: `textbooks/{slug}/curriculums/{curriculum-id}/{outline.yaml, chapters/, quizzes/}`。

## トーン

- **ですます調・実務寄り**(`meta.yaml` の `style` に従う)。
- 抽象論で終わらせず、具体例・実務での使いどころを必ず添える。

## 図解

- **Mermaid をデフォルト**とする。関係性=graph、順序=sequence/flowchart、状態=stateDiagram、データ=erDiagram。
- 複雑すぎて Mermaid で破綻する場合のみ別記法を検討(将来 D2)。

## メタ情報の正本(source of truth)

| 情報 | 正本 |
| --- | --- |
| 教材全体メタ・カリキュラムの順序 | `meta.yaml`(`curriculum_order`) |
| カリキュラムメタ・章の順序 | `curriculums/{id}/curriculum.yaml`(`chapter_order`) |
| 章立ての構想(骨子) | `curriculums/{id}/outline.yaml`(生成の入力のみ。本文の正本ではない) |
| 章メタ・節の順序 | `chapters/{id}/chapter.yaml` |
| 節メタ(title, estimated_minutes 等) | section `.md` の frontmatter(**最優先**) |

outline と frontmatter が食い違う場合は frontmatter を正とする。

## frontmatter 必須

各セクション `.md` には frontmatter を必ず付ける(将来の RAG・検索・引用のため)。
`section_id, chapter_id, title, order, estimated_minutes, estimated_chars, learning_points, tags, related_sections, key_terms`。

## クイズ

- **distractor の品質を重視**。完全にランダムな誤答は不可。
- 「ほぼ正解だが部分的に違う」選択肢を 1 つは入れる。
- 各問題に `source_refs`(`section_id` + anchor)を必ず付け、根拠を本文に紐づける。

## レビュー

- 生成物は **必ず reviewer agent を通す**(`.claude/agents/reviewer.md`)。
- reviewer は **指摘レポートのみ**を返す。自動修正はしない。修正は人間の判断、または該当 skill の再実行で行う。

## 命名規則

- `curriculum-id`: 英小文字・数字・ハイフンの slug(`"basics"`, `"advanced"`)。
- `chapter_id`: ゼロ埋め 2 桁(`"01"`)。
- `section_id`: `{chapter_id}-{2桁節番号}`(`"01-02"`)。
- セクションファイル名: `{2桁節番号}-{section-slug}.md`(`02-security-model.md`)。

## 安全

- ローカルディレクトリ参照を含む教材は `meta.yaml` に `contains_local_sources: true` を立て、誤公開を防ぐ。
- `meta.yaml` の `visibility` を勝手に `public` にしない。
