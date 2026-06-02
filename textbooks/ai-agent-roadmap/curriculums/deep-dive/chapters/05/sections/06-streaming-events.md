---
section_id: "05-06"
chapter_id: "05"
title: Streaming とイベント設計 — UI に進捗を返す
order: 6
estimated_minutes: 4
estimated_chars: 1700
learning_points:
  - LangGraph の stream モード三種(values / updates / messages)の違い
  - astream_events で粒度の細かいイベントを受け取る使い方
  - UI に進捗を返すときのイベント設計の勘所
tags:
  - langgraph
  - streaming
  - events
  - ux
related_sections:
  - "05-04"
  - "05-05"
  - "05-02"
key_terms:
  - term: stream モード
    definition: `app.stream(..., stream_mode=...)` で指定する出力粒度。"values" / "updates" / "messages" などがある
  - term: astream_events
    definition: Node 開始・LLM トークン・ツール結果など細粒度のイベントを async に受け取る LangGraph の API
  - term: イベント設計
    definition: バックエンドのどの瞬間を UI のどの表示要素に対応させるかを定義する設計作業
---

# Streaming とイベント設計 — UI に進捗を返す

## このセクションで学ぶこと

- LangGraph の stream モード三種(values / updates / messages)の違い
- astream_events で粒度の細かいイベントを受け取る使い方
- UI に進捗を返すときのイベント設計の勘所

## なぜ streaming が必要か

Agent は応答までに数秒〜数十秒かかることが珍しくありません。ユーザーから見れば、その間に **何が起きているか** が見えないと「固まった」と感じます。LangGraph には、グラフの進行を **リアルタイムに UI へ流す** ための streaming API が組み込まれています。

streaming で UI に流したい情報は、おおむね三層に分けられます。

- **粗い進捗**: 「いま検索中」「ツールを呼んでいる」「最終回答を生成中」のような Node 単位の状態表示
- **本文ストリーム**: LLM が生成中のトークンをリアルタイムに表示する
- **構造化イベント**: ツール入力・ツール結果・エラーなど、UI で別パネルに出したい個別イベント

LangGraph はこの三つを別々の API で扱えるようになっています。

## stream モードの基本

最も簡単なのは `app.stream(...)` です。`stream_mode` 引数で粒度を選びます。

```python
config = {"configurable": {"thread_id": "task-1"}}

# 1) values: 各ステップ後の State 全体
for state in app.stream(input, config=config, stream_mode="values"):
    print(state)

# 2) updates: 各 Node が返した差分だけ
for upd in app.stream(input, config=config, stream_mode="updates"):
    print(upd)   # {"plan": {"messages": [...]}} のような形

# 3) messages: LLM が出力するトークンをチャンクで
for chunk, metadata in app.stream(input, config=config, stream_mode="messages"):
    print(chunk.content, end="")
```

使い分けのコツはシンプルです。**粗い進捗バーには `updates`、本文の逐次表示には `messages`、デバッグや内部監視には `values`** が向いています。`updates` は差分だけなので帯域も軽く、UI での「○○中…」表示に最適です。

## astream_events で細粒度に拾う

stream モードよりさらに細かい単位でイベントを受け取りたいときは `astream_events` を使います。Node の開始・終了、LLM の各トークン、ツール呼び出しの開始・結果などが、種類タグ付きで流れてきます。

```python
async for event in app.astream_events(input, config=config, version="v2"):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        ws.send_text(token)                       # 本文を WebSocket で UI へ
    elif kind == "on_tool_start":
        ws.send_json({"type": "tool", "name": event["name"], "status": "start"})
    elif kind == "on_tool_end":
        ws.send_json({"type": "tool", "name": event["name"], "status": "end"})
```

`event["event"]` の文字列(`on_chain_start`、`on_chat_model_stream`、`on_tool_end` など)を見て、UI 側のどの表示要素に対応させるかを決めます。**チャット UI の本体はトークンを繋ぎ、サイドパネルでツール実行のログを出す**、というような構成がこれで素直に組めます。

## UI イベント設計の勘所

バックエンドの内部イベントをそのまま UI に流すと、変更に弱くなります。設計上のコツを三つ挙げます。

- **UI 用イベント型を独自に切る**: LangGraph のイベント名そのままではなく、`{"type": "progress" | "token" | "tool" | "error", ...}` のような **自前のドメイン型** に変換してから送る。バックエンドの API 変更が UI に直接波及しなくなります
- **粗い表示は updates、本文は astream_events**: 同じ Agent に両方を流すこともできます。WebSocket チャンネルを役割で分け、UI 側で別経路として扱うと安定します
- **エラーも明示的なイベントとして流す**: 例外を投げっぱなしにしないこと。`on_chain_error` を拾って `{"type": "error", "message": ...}` を送ると、UI 側の状態遷移(再試行ボタンの表示など)が組みやすくなります

HITL(05-05)と組み合わせるときは、**interrupt で停止した瞬間にも UI に「承認待ち」イベントを流す** 設計が要ります。停止は例外ではなく正常状態なので、UI を待ち画面に切り替えるのは streaming 側の責務になります。Agent の体験品質は最終的に **イベント設計の解像度** で決まる、と言ってもよいぐらいです。

## まとめ

- stream モードは values / updates / messages の三粒度を使い分ける
- astream_events は Node・LLM トークン・ツール単位の細かいイベントを受け取れる
- UI には LangGraph のイベントをそのまま流さず、自前のドメイン型に変換して送る
