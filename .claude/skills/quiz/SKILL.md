---
name: quiz
description: 指定された章(複数可)の本文から 4 択クイズを生成するオーケストレータ。ユーザーが「第〇章のクイズを作って」「第〇〜△章の問題をまとめて作って」など、章本文から演習問題を作りたいときに使う。実際の出題は quiz-writer agent に委譲し、複数章を並列で生成する。
---

# quiz — 4 択クイズ生成のオーケストレータ

このスキルは **薄いラッパー** です。実際のクイズ生成は **`quiz-writer` agent** が独立コンテキストで行います。スキーマ・distractor 戦略・source_refs ルールは agent が preload する `textbook-style` skill に集約されているので、ここには **どう振り分けるか** だけを書きます。

## 役割の境界

- **このスキル**: 入力の解釈 / 章リストの組み立て / `quiz-writer` の並列起動 / サマリの集約。
- **quiz-writer**: 1 章分の `quizzes/{chapter-id}.json` の生成。
- **textbook-style**: 出題規約の正本(agent が preload)。
- **reviewer**: 生成後の品質点検(必要に応じて別途呼ぶ)。

## 入力の確認(対話)

1. `slug` / `curriculum-id` / 章 ID のリストを確認する。指定が無ければ AskUserQuestion で聞く。
2. 対象章の **本文(sections)が既に生成済み** であることを確認する(無ければ `chapter` skill を先に走らせる)。
3. すでに `quizzes/{chapter-id}.json` がある場合は、上書きしてよいかユーザーに確認する。

## 実行(並列起動)

要求された章を **1 メッセージで複数の Agent tool 呼び出しに分割** して起動する。1 章 = 1 agent。

- subagent_type は `quiz-writer`。
- 各 agent の prompt には `slug` / `curriculum-id` / `chapter-id` を明示し、「自分の章だけ」を念押しする。
- **推奨並列数は 3〜5**。多い場合は 5 章ずつバッチ。
- 親(main)では各 agent のサマリ(出力パス / 問題数 / source_refs 照合結果 / distractor 自己評価)だけ受け取る。

## 完了後

- サマリを集約してユーザーに提示する。
- 必要なら **`reviewer` agent** を起動して「正解の一意性」「根拠の妥当性」「distractor 品質」を点検する。指摘が出たら該当章だけ quiz-writer を再起動。
