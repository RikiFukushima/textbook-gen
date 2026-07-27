---
section_id: "03-02"
chapter_id: "03"
title: interrupt / resume で人間承認を挟む
order: 2
estimated_minutes: 5
estimated_chars: 1197
learning_points:
  - interrupt でグラフの実行を途中停止し、人間に判断を委ねる仕組みを理解する
  - Command(resume=...) で人間の入力を渡してグラフを続きから再開する流れをつかむ
  - 生成したドラフトを人間が確認・修正してから再開する具体的な形を書ける
tags: [langgraph, interrupt, resume, human-in-the-loop, command]
related_sections: ["03-01", "03-03"]
key_terms:
  - term: interrupt
    definition: LangGraph でノードの実行を一時停止し、外部(人間)からの入力を待つための関数。呼ばれた時点でグラフの実行が止まる。
  - term: resume
    definition: 中断したグラフに人間の入力を渡して続きから再開する操作。Command オブジェクトの resume 引数で値を注入する。
  - term: Command
    definition: LangGraph でグラフの再開や次の遷移先の指定などをまとめて表す制御オブジェクト。
---

## このセクションで学ぶこと

- `interrupt` でグラフの実行を途中で止め、人間に判断を委ねる仕組み
- `Command(resume=...)` で人間の入力を渡し、続きから再開する流れ
- 生成したドラフトを人間が確認・修正してから再開する具体的な形

## interrupt は「ここで人間を待つ」の宣言

前のセクションで、checkpoint があれば「止めて待てる」ことを確認しました。実際に止めるのが **interrupt** です。ノードの中で `interrupt(...)` を呼ぶと、その時点でグラフの実行が停止し、呼び出し元に「人間に見せたい情報」が返ってきます。State は checkpointer に保存されているので、そのまま何時間でも待てます。

Zendesk 案件でいえば、AI が生成した返信ドラフトを担当者に提示し、「これで送っていいか」を確認してもらう場面です。interrupt に渡した内容(ドラフト本文など)がフロント側に届き、担当者はそれを見て承認・修正・却下を判断します。

```python
from langgraph.types import interrupt

def human_review(state):
    # ここで実行が止まり、draft が呼び出し元に返る
    decision = interrupt({
        "draft": state["draft"],
        "message": "この返信ドラフトを確認してください",
    })
    # resume で渡された値が decision に入る(再開後にここから続行)
    return {"review": decision}
```

## resume は「人間の答えを渡して続きを動かす」

担当者が判断を返してきたら、`Command` の `resume` に値を入れてグラフを呼び直します。すると `interrupt(...)` が **その値を返り値として** 続きを実行します。ポイントは、止まった `human_review` ノードの **頭からではなく、interrupt の地点から** 再開される点です。

```python
from langgraph.types import Command

config = {"configurable": {"thread_id": "ticket-12345"}}

# 1回目: 生成 → human_review で停止。__interrupt__ にドラフトが入って返る
result = graph.invoke({"ticket_text": "返品したい"}, config=config)

# 人間が確認・修正した内容を resume で注入して再開
graph.invoke(
    Command(resume={"approved": True, "edited_draft": "修正済みの本文"}),
    config=config,
)
```

`resume` に渡すのはただの承認フラグでも、担当者が **手直ししたドラフト本文** でも構いません。「AI の案を人間が上書きして確定する」という形が、そのまま resume の値で表現できます。

> `interrupt` / `Command` の import パスや戻り値の形はバージョンにより差異があります。実装時は公式ドキュメントで最新仕様を確認してください。

## 注意点

- **interrupt は checkpointer 必須**です(03-01)。付けずに使うと状態が保存されず再開できません。
- interrupt が呼ばれると、そのノード内で interrupt より **前に書いた副作用(API 呼び出しなど)は再開時に再実行され得ます**。外部への書き込みは interrupt の後、承認済みが確定してから行うのが安全です。
- resume する呼び出しでは新しい入力データではなく `Command(resume=...)` を渡します。ここを取り違えると別の処理として走ってしまいます。

## まとめ

- interrupt はノード内で実行を止め、人間に見せたい情報を返す「待ち」の宣言
- Command(resume=値) で人間の答えを渡すと、interrupt の地点から続きが動く
- resume の値に修正済みドラフトを載せれば「人間が上書きして確定」が表現できる
