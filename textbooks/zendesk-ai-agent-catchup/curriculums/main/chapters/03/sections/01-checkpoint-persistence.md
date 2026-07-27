---
section_id: "03-01"
chapter_id: "03"
title: checkpoint で状態を永続化する
order: 1
estimated_minutes: 5
estimated_chars: 1344
learning_points:
  - LangGraph の checkpointer がグラフの State をステップごとに保存する仕組みだと理解する
  - 人間承認フローで「途中で止めて待つ」には状態の永続化が前提になる理由を説明できる
  - thread_id で会話・処理の単位ごとに状態を分けて再開する構図をつかむ
tags: [langgraph, checkpoint, 永続化, state, human-in-the-loop]
related_sections: ["03-02", "03-03"]
key_terms:
  - term: checkpointer
    definition: LangGraph でグラフの State を各ステップ後に保存する仕組み。中断・再開・履歴の巻き戻しを可能にする。
  - term: thread_id
    definition: どの会話・処理の状態かを識別するキー。同じ thread_id を指定して呼び出すと保存済みの状態から続きを実行できる。
  - term: State
    definition: LangGraph のグラフ全体で共有され、ノードを通るたびに更新されていくデータのまとまり。
---

## このセクションで学ぶこと

- LangGraph の checkpointer が State をステップごとに保存する仕組みであること
- 人間承認フローで「途中で止めて待つ」には、なぜ状態の永続化が前提になるのか
- `thread_id` で処理の単位ごとに状態を分けて再開する構図

## checkpoint は「グラフの途中経過のセーブデータ」

LangGraph のグラフは、ノードを通るたびに **State** というデータのまとまりを更新していきます。この State を各ステップの後で自動保存してくれるのが **checkpointer** です。ゲームのセーブデータをイメージすると近くて、「どのノードまで進んだか」「State の中身は今どうなっているか」を丸ごと記録します。

なぜこれが重要かというと、人間承認フローでは処理を **途中で止めて人間の判断を待つ** からです。AI が返信ドラフトを生成したあと、担当者が確認して「OK」を出すまで、そのグラフは数分〜数時間、場合によっては翌日まで待つことになります。プロセスがメモリ上で State を抱えたまま待ち続けるのは現実的ではありません。Webhook で起動したサーバーレス関数なら、待っている間にとっくにタイムアウトして消えています。

そこで、生成したドラフトや途中経過を checkpointer で外部に保存しておきます。人間が承認を返してきたら、保存済みの State を読み直して続きから実行する。**「止めて待つ」を成立させる土台が checkpoint** だ、というのがこの章全体の出発点です。

## thread_id で「どの処理の続きか」を指定する

保存された状態は `thread_id` というキーで区別します。Zendesk なら「チケット 1 件ごと」に thread_id を割り当てるイメージです。呼び出すときに config で thread_id を渡すと、その ID に紐づく状態から続きを実行できます。

```python
from langgraph.checkpoint.memory import InMemorySaver

# 開発用のインメモリ checkpointer(本番は DB 実装に差し替える)
checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "ticket-12345"}}
graph.invoke({"ticket_text": "返品したい"}, config=config)

# 後で同じ thread_id を渡すと、保存済みの状態から続きを実行できる
graph.invoke(None, config=config)
```

`InMemorySaver` はプロセスが死ぬと消えるので学習・検証用です。本番では Postgres や Redis などの永続化実装(`PostgresSaver` 等)に差し替えます。Zendesk 案件なら第05章で扱う Supabase を保存先にする構成が自然です。

> checkpointer のクラス名や import パスはバージョンにより差異があります。実装時は必ず公式ドキュメントで最新の API を確認してください。

## 注意点

- **checkpointer を付けないと interrupt / resume は使えません**。次のセクションの中断・再開は、状態が保存されていて初めて成立します。
- thread_id を使い回すと別の処理の状態を上書き・混線させます。**処理単位で一意な ID** を必ず振ってください。
- インメモリ実装のまま本番に出すと、再起動やスケールアウトで状態が消えます。保存先は永続 DB にする前提で設計します。

## まとめ

- checkpointer は State をステップごとに保存する「セーブデータ」の仕組み
- 人間承認は「止めて待つ」ため、状態の永続化がなければ再開できない
- thread_id で処理単位ごとに状態を分け、同じ ID を渡して続きから実行する
