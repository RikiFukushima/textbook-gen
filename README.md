# Textbook Generator

Claude Code を生成エンジンに、任意の学習対象から教材(Markdown)と 4 択問題を自動生成し、Next.js ビューワで閲覧・演習するツール。

要件・設計の詳細は [`docs/textbook-gen-spec.md`](./docs/textbook-gen-spec.md) を参照。

## 構成

```
.claude/          生成パイプライン(skill / agent)
  ├─ CLAUDE.md    プロジェクト方針(生成時に守る要点)
  ├─ skills/
  │   ├─ outline/ 学習対象 → 骨子(outline.yaml)
  │   ├─ chapter/ 骨子 → セクション本文(Markdown)
  │   └─ quiz/    本文 → 4 択問題(JSON)
  └─ agents/
      └─ reviewer.md  生成物の品質レビュー(指摘のみ)
textbooks/        生成物(教材ごとに {slug}/)
viewer/           Next.js ビューワ(Phase 2)
scripts/          sync / init-textbook(Phase 2)
docs/             スキーマ・UX 設計
```

## 生成の基本単位

教材(5-10h) → 章(12-25 分 / 3-5 セクション) → セクション(3-5 分 / 1500-2000 字) → クイズ(4 択)

## 使い方(生成パート)

Claude Code 上で以下の skill を順に使う:

1. `outline` — 学習対象から骨子を作る
2. `chapter` — 章ごとに本文セクションを生成
3. `quiz` — 章ごとに 4 択問題を生成
4. `reviewer` agent で点検

## ロードマップ

Phase 1: 生成パイプライン(本リポジトリの現状) → Phase 2: 閲覧サイト → Phase 3: 共有 → 以降は spec 参照。
