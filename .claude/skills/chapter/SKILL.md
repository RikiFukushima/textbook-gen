---
name: chapter
description: outline.yaml から指定された章(複数可)の本文を生成するオーケストレータ。ユーザーが「第〇章の本文を書いて」「第〇〜△章を一気に書いて」など、骨子から教材本文を生成したいときに使う。実際の執筆は chapter-writer agent に委譲し、複数章を並列で生成する。
---

# chapter — 章本文生成のオーケストレータ

このスキルは **薄いラッパー** です。実際の本文執筆は **`chapter-writer` agent** が独立コンテキストで行います。執筆規約・スキーマ・字数ルールは agent が preload する `textbook-style` skill に集約されているので、ここには **どう振り分けるか** だけを書きます。

## 役割の境界

- **このスキル**: 入力の解釈 / 章リストの組み立て / `chapter-writer` の並列起動 / サマリの集約。
- **chapter-writer**: 1 章分の `chapter.yaml` と全セクション Markdown の執筆。
- **textbook-style**: 執筆規約の正本(agent が preload)。
- **reviewer**: 生成後の品質点検(必要に応じて別途呼ぶ)。

## 入力の確認(対話)

1. `slug`(教材)・`curriculum-id`(カリキュラム)・章 ID のリストを確認する。指定が無ければ AskUserQuestion で聞く。
2. 対象 curriculum の `outline.yaml` を Read し、要求された章 ID が実在することを確認する。
3. すでに `chapters/{chapter-id}/` がある場合は、上書きしてよいかユーザーに確認する。

## 実行(並列起動)

要求された章を **1 メッセージで複数の Agent tool 呼び出しに分割** して起動する。1 章 = 1 agent。

- subagent_type は `chapter-writer`。
- 各 agent の prompt には `slug` / `curriculum-id` / `chapter-id` を明示し、「他の章には触れない」ことを念押しする。
- **推奨並列数は 3〜5**。多すぎる場合は 5 章ずつバッチで起動する。
- 親(main)では各 agent のサマリ(生成ファイルパスと実測字数、加筆有無、懸念)だけ受け取り、章本文の中身を読み込まない(コンテキスト節約)。

起動例(概念):

```
[Agent #1] chapter-writer  slug=ai-agent-roadmap curriculum-id=foundations chapter-id=02
[Agent #2] chapter-writer  slug=ai-agent-roadmap curriculum-id=foundations chapter-id=03
[Agent #3] chapter-writer  slug=ai-agent-roadmap curriculum-id=foundations chapter-id=04
```

を 1 メッセージにまとめて投げる。

## 完了後

- 各 agent のサマリを 1 つの表に集約してユーザーに提示する(章ID / セクション数 / 実測字数 / 加筆の有無 / 懸念)。
- 必要に応じて **`reviewer` agent** を起動して指摘レポートを得る(reviewer は自動修正しないので、修正が必要なら該当章だけ chapter-writer を再起動)。
- クイズ生成は別タスク(`quiz` skill)。
