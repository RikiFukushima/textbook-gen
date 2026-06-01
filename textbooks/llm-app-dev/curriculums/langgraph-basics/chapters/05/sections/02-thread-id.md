---
section_id: "05-02"
chapter_id: "05"
title: thread_idで会話を継続する
order: 2
estimated_minutes: 5
estimated_chars: 1200
learning_points:
  - thread_id がチェックポイントを束ねる会話・セッションの識別子であることを理解する
  - config の configurable.thread_id で実行を特定の会話に紐づける方法を知る
  - 同じ thread_id で再 invoke すると続きから動く挙動を理解する
tags:
  - langgraph
  - thread-id
  - persistence
related_sections:
  - "05-01"
  - "05-03"
key_terms:
  - term: thread_id
    definition: チェックポイント群を束ねる会話・セッションの識別子。同じ thread_id を指定すると過去の State を引き継いで実行できる。
  - term: config
    definition: グラフ実行時に渡す設定オブジェクト。configurable.thread_id などの実行時パラメータを格納する。
  - term: get_state
    definition: 指定した thread_id の最新チェックポイント(現在の State)を取得するメソッド。
---

## このセクションで学ぶこと

- thread_id がチェックポイントを束ねる会話・セッションの識別子であることを理解する
- config の configurable.thread_id で実行を特定の会話に紐づける方法を知る
- 同じ thread_id で再 invoke すると続きから動く挙動を理解する

## thread_id は会話の住所

前のセクションで、checkpointer はノードごとに State を保存すると説明しました。では、保存された大量のチェックポイントを「どの会話のものか」で区別するにはどうするのでしょうか。その鍵が **thread_id** です。

thread_id は、一連のチェックポイントを束ねる「会話の住所」のようなものです。チャットアプリなら 1 ユーザーの 1 会話に 1 つ、エージェントなら 1 タスクの実行系列に 1 つ、といった単位で割り当てます。同じ thread_id を指定して実行すれば、checkpointer はその thread_id の最新チェックポイントを読み出し、**前回の続きから State を引き継いで**動きます。逆に違う thread_id を渡せば、まっさらな State で始まります。

## 具体例:同じ thread_id で続きを動かす

thread_id は実行時の `config` の `configurable` に入れて渡します。

```python
config = {"configurable": {"thread_id": "user-42-chat-1"}}

# 1 回目:State はゼロから始まる
app.invoke({"messages": [("user", "私の名前はリキです")]}, config)

# 2 回目:同じ thread_id なので前回の messages を引き継ぐ
app.invoke({"messages": [("user", "私の名前は何でしたか?")]}, config)
```

2 回目の呼び出しでは、checkpointer が `user-42-chat-1` の State を復元してから新しい入力を足すため、モデルは過去のやり取りを踏まえて応答できます。`messages` の reducer が追記マージ(第 4 章で扱った `add_messages` など)になっていれば、履歴は自然に積み上がっていきます。

現在の State を覗きたいときは `get_state` を使います。

```python
snapshot = app.get_state(config)
print(snapshot.values)        # 現在の State の中身
print(snapshot.next)          # 次に実行されるノード
```

## 注意点

thread_id の設計はアプリの「会話の単位」と直結します。ユーザーごとに 1 つにすると過去の全会話が混ざってしまい、リクエストごとに毎回ランダムにすると履歴が一切残りません。**「どこまでを 1 つの連続した文脈とみなすか」**を決めてから thread_id の粒度を決めてください。

また、同じ thread_id を使い続けると messages がどんどん増え、トークン上限や応答速度に影響します。長い会話では古い履歴を要約してまとめるなどの工夫が必要になります。thread_id は便利ですが「無限に履歴を貯められる魔法」ではない点に注意しましょう。

## まとめ

- thread_id はチェックポイントを束ねる会話・セッションの識別子で、config の configurable に入れて渡す。
- 同じ thread_id で再 invoke すると過去の State を引き継ぎ、会話の続きから動かせる。
- thread_id の粒度は「連続した文脈の単位」で設計し、履歴の肥大化にも気を配る。
