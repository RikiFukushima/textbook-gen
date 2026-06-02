---
section_id: "05-02"
chapter_id: "05"
title: State / Node / Edge の役割分担
order: 2
estimated_minutes: 4
estimated_chars: 1563
learning_points:
  - State はなぜ TypedDict と reducer で定義するのか
  - Node が「pure な State 更新関数」であるべき理由
  - Edge には「固定エッジ」と「条件付きエッジ」がある
tags:
  - langgraph
  - state
  - node
  - edge
related_sections:
  - "05-01"
  - "05-03"
  - "05-04"
key_terms:
  - term: TypedDict
    definition: Python の型ヒントで辞書のキーと値の型を宣言する仕組み。State の型として LangGraph が推奨
  - term: Reducer
    definition: State のフィールドをどう更新するかを定義する関数。`Annotated[list, add_messages]` のようにフィールドに紐づける
  - term: Node
    definition: State を受け取り、State の差分(部分辞書)を返す関数。LangGraph の処理単位
  - term: Edge
    definition: Node 間の遷移を表す矢印。常に同じ次ノードへ進む固定エッジと、関数の戻り値で行き先を決める条件付きエッジがある
---

# State / Node / Edge の役割分担

## このセクションで学ぶこと

- State はなぜ TypedDict と reducer で定義するのか
- Node が「pure な State 更新関数」であるべき理由
- Edge には「固定エッジ」と「条件付きエッジ」がある

## State — 共有ボードのスキーマ

State は Agent 全体で共有される「作業用のホワイトボード」です。LangGraph では Python の `TypedDict` でスキーマを宣言します。型を明示する理由は二つあり、一つは **Node の入出力契約を IDE と型チェッカーで縛れる** こと、もう一つは **どのフィールドをどう更新するかを reducer で宣言** できることです。

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]   # 履歴は追記
    tool_calls: list                          # 上書き
    iterations: int                           # 上書き
```

`Annotated[list, add_messages]` の `add_messages` が reducer です。Node が `{"messages": [new_msg]}` を返すと、LangGraph は **既存の messages に追記** してくれます。reducer を指定しないフィールドは **上書き** になります。会話履歴のように積み上げたい値には add 系の reducer、現在のループ回数のような単一値には上書きを使い分けます。

設計上の鉄則は **State はシリアライズ可能な値だけ** で持つことです。DB コネクションや巨大なバイナリを State に入れると Checkpointing が壊れます。

## Node — State を受けて差分を返す関数

Node は **State を受け取り、State の更新差分(部分辞書)を返す関数** です。Agent の処理単位はすべてこの形に揃えます。

```python
def call_llm(state: AgentState) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def call_tool(state: AgentState) -> dict:
    tool_msg = execute_tool(state["messages"][-1].tool_calls[0])
    return {"messages": [tool_msg]}
```

書き方のコツは三つあります。

- **入力は State だけ、出力は差分だけ**。Node の中で外部副作用は最小にし、結果は必ず State に書き戻します
- **一 Node 一責務**。「LLM を呼ぶ」「ツールを実行する」「結果を整形する」を別 Node に分けるとデバッグが楽になります
- **冪等性を意識**。リトライや再生時に二重に呼ばれても破綻しないよう、外部書き込みを伴う Node は工夫します(あとで Checkpointing の節でも触れます)

Node を「**State から State への純粋関数**」に寄せておくと、テストはただの関数呼び出しになり、LangSmith での再生も自然に成立します。

## Edge — 進路を決める二種類の矢印

Edge は Node から Node への遷移を表します。種類は二つだけです。

- **固定エッジ** `add_edge("plan", "tool")` — 常に同じ次ノードへ進む
- **条件付きエッジ** `add_conditional_edges("plan", router_fn, {...})` — ルータ関数の戻り値で行き先を決める

`START` と `END` は LangGraph が用意した特別なノードで、グラフの入口と出口を表します。最小のグラフは「START → 何かの Node → END」という直線です。

```python
from langgraph.graph import StateGraph, START, END

graph = StateGraph(AgentState)
graph.add_node("plan", call_llm)
graph.add_node("tool", call_tool)
graph.add_edge(START, "plan")
graph.add_edge("tool", "plan")          # ツール実行後は plan に戻る
graph.add_conditional_edges("plan", route_after_plan, {
    "tool": "tool",
    "end": END,
})
```

`route_after_plan` は State を受け取って `"tool"` か `"end"` の文字列を返す純関数です。条件付きエッジの詳細は次節で扱います。ここでは「**進路ロジックは Node ではなく Edge 側に出す**」のが LangGraph の流儀だと覚えてください。Node を純粋に保ち、進路は Edge に集約することで、図と実装が一対一に保たれます。

## まとめ

- State は TypedDict + reducer で「何を共有し、どう更新するか」を宣言する
- Node は State を受けて差分を返す純関数。一 Node 一責務・冪等性を意識する
- 進路ロジックは Node に書かず、固定エッジ・条件付きエッジで Edge 側に出す
