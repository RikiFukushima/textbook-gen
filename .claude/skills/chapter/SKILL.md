---
name: chapter
description: outline.yaml の 1 章分から、複数のセクション Markdown 本文と章メタ(chapter.yaml)を生成する。ユーザーが「第〇章の本文を書いて」「この章を生成して」「セクションを書き起こして」など、骨子から教材本文を生成したいときに使う。
---

# chapter — 章本文生成

`outline.yaml` の 1 章分を受け取り、`textbooks/{slug}/chapters/{chapter-id}/` 配下に `chapter.yaml` と複数の section `.md` を生成します。

## 出力

```
chapters/{chapter-id}/
  ├─ chapter.yaml          # 章メタ(id, title, estimated_minutes, learning_objectives, section_order)
  └─ sections/
      ├─ 01-{section-slug}.md
      └─ 02-{section-slug}.md
```

## 各セクション Markdown のテンプレート

frontmatter(必須):

```yaml
---
section_id: "01-02"
chapter_id: "01"
title: ...
order: 2
estimated_minutes: 4
estimated_chars: 1800
learning_points: [...]
tags: [...]
related_sections: [...]   # 前提・関連セクション
key_terms:                # 本文に登場する重要用語の定義
  - term: ...
    definition: ...
---
```

本文構成:

1. `## このセクションで学ぶこと`(`learning_points` の箇条書き)
2. 本文(**概念 → 具体例 → 注意点** の 3 層構造)
3. 必要箇所に Mermaid 図解(関係=graph / 順序=sequence・flowchart / 状態=stateDiagram / データ=erDiagram)
4. `## まとめ`(3 行以内の箇条書き)

## 長さの自動調整

- 目標 **1500-2000 字**。超過時は分割、不足時は隣接統合を提案する。
- 下限 1200 字・上限 3000 字。**2500 字超は reviewer に警告フラグ**を立てる。
- 例外: 概念導入は 500-1000 字でも可。図解中心セクションは図の質を優先。

## ルール

- frontmatter の `key_terms` は本文に実際に登場する語のみ。
- `related_sections` で前提・後続の伏線を貼る(RAG・回遊のため)。
- トーンは `meta.yaml` の `style.tone`(既定: ですます調・実務寄り)。

## 完了後

reviewer agent に通して指摘を受ける(本文の自動修正はしない)。問題生成は `quiz` skill。
