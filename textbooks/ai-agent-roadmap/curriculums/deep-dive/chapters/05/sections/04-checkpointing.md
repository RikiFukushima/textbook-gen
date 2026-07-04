---
section_id: "05-04"
chapter_id: "05"
title: Checkpointing と状態永続化 — 長時間タスクの中断・再開
order: 4
estimated_minutes: 4
estimated_chars: 1835
learning_points:
  - Checkpointer の役割と保存単位(thread_id / step)
  - InMemory / SQLite / Postgres など実装の使い分け
  - 中断・再開、タイムトラベルでデバッグするときの考え方
tags:
  - langgraph
  - checkpointing
  - persistence
related_sections:
  - "05-02"
  - "05-05"
  - "05-06"
key_terms:
  - term: Checkpointer
    definition: 各ステップ後の State をスナップショットとして保存し、後から取り出せるようにする LangGraph のコンポーネント
  - term: thread_id
    definition: 一連の対話・タスクを一意に識別する ID。Checkpointer はこの ID 単位で State 履歴を持つ
  - term: タイムトラベル
    definition: 過去のチェックポイントから State を読み戻して、別の経路で再実行できる LangGraph の機能
---

## このセクションで学ぶこと

- Checkpointer の役割と保存単位(thread_id / step)
- InMemory / SQLite / Postgres など実装の使い分け
- 中断・再開、タイムトラベルでデバッグするときの考え方

## なぜ State を「外」に保存するのか

Agent の処理は数秒で終わるとは限りません。ツール呼び出しが数十回続いたり、人間の承認待ちで数時間止まったり、夜間バッチで途中まで進めて翌朝続行することもあります。State をプロセス内のメモリだけに持っていると、**プロセスを再起動した瞬間に途中経過が消えます**。

LangGraph はこれを解くために **Checkpointer** という抽象を持っています。グラフを `compile(checkpointer=...)` するときに渡すだけで、**各ステップの直後に State のスナップショットが自動で保存** されます。アプリ側は `thread_id` を指定して invoke するだけで、続きから再開できます。

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# from_conn_string はコンテキストマネージャを返すため with で受ける
with SqliteSaver.from_conn_string("agent.db") as checkpointer:
    app = graph.compile(checkpointer=checkpointer)

    config = {"configurable": {"thread_id": "user-42"}}
    app.invoke({"messages": [HumanMessage("調べて")]}, config=config)
    # プロセス再起動後でも、同じ thread_id で続きから再開できる
    app.invoke({"messages": [HumanMessage("続き")]}, config=config)
```

ここで重要なのは保存の単位です。Checkpointer は **`thread_id` ごとに、ステップ単位で State 履歴を持ちます**。一つの会話・タスクが一つの thread に対応し、その中に「ステップ 0 → ステップ 1 → …」と複数のスナップショットが並びます。

## 実装の使い分け

LangGraph 0.2 系には次のような Checkpointer 実装が用意されています。

- **`MemorySaver`**: プロセス内辞書に保存。開発・テスト向け。プロセスが落ちると消える
- **`SqliteSaver`**: 単一ファイルの SQLite に保存。**ローカル開発や小規模運用の定番**
- **`PostgresSaver`**: Postgres に保存。**本番運用** で複数ワーカー・複数プロセスから同じ thread を扱うときに使う
- **クラウド系**: LangGraph Cloud / カスタム実装で Redis / DynamoDB などにも書ける

選定の指針は素直です。単一プロセスでよければ SQLite、複数プロセスで共有するなら Postgres、要件が固まる前のプロトタイプは MemorySaver で十分です。**Checkpointer の差し替えはアプリコードに触らず `compile` の引数だけで切り替えられる** ので、最初から派手な構成にする必要はありません。

## 中断・再開とタイムトラベル

Checkpointer のもう一つの恩恵が **タイムトラベル** です。過去のスナップショットを取り出して、別の入力で再実行できます。デバッグや A/B 的な検証で強力です。

```python
# 履歴を一覧
for snap in app.get_state_history(config):
    print(snap.values, snap.next)

# ある時点に戻して別の選択肢で再実行
past_config = {"configurable": {"thread_id": "user-42", "checkpoint_id": "..."}}
app.invoke(None, config=past_config)
```

`get_state_history` は新しい順にチェックポイントを返し、各スナップショットは「そのときの State」と「次に走るはずだった Node」を持っています。`checkpoint_id` を指定して invoke すると、**そこから先だけが再実行** されます。Conditional Edge のルータを修正したとき、過去の失敗ケースだけ巻き戻して再実行できるのは現場で効きます。

## 実務での注意点

- **State はシリアライズ可能に保つ**: DB コネクションや巨大バイナリを入れないこと。pickle 不能なオブジェクトで Checkpointing は壊れます
- **副作用のある Node に冪等性を**: 再開時に同じ Node が再実行される可能性があります。外部 API への書き込みや課金処理は **冪等キー** で守るのが鉄則です
- **thread_id の設計**: ユーザー単位、会話単位、ジョブ単位など、**やり直しの単位** に合わせて thread_id を切ります。ここの粒度を間違えると履歴がごちゃ混ぜになります
- **保存容量に気を配る**: ステップごとに State 全体が保存されるため、大きな履歴は容量を食います。古い thread の削除ポリシーを最初から決めておきましょう

## まとめ

- Checkpointer は thread_id 単位で各ステップの State スナップショットを保存する仕組み
- 実装は MemorySaver / SqliteSaver / PostgresSaver を要件に応じて差し替える
- 中断・再開とタイムトラベルが手に入る代わりに、シリアライズと冪等性の設計が必要になる
