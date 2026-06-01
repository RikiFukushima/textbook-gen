---
section_id: "04-02"
chapter_id: "04"
title: Tool callingの仕組み
order: 2
estimated_minutes: 5
estimated_chars: 1035
learning_points:
  - LLM が直接ツールを実行するのではなく「呼び出し要求(tool call)」を返すことを理解する
  - bind_tools でモデルにツールを渡し、tool_calls を受け取る流れを把握する
  - 「要求 → 実行 → 結果をモデルに戻す」往復が必要なことを理解する
tags:
  - tool-calling
  - function-calling
  - chatmodel
related_sections:
  - "04-01"
  - "04-03"
key_terms:
  - term: Tool calling
    definition: LLM が「どのツールを・どんな引数で呼びたいか」を構造化データ(tool call)として出力する仕組み。LLM 自身がコードを実行するのではなく、呼び出しの意図を返す。
  - term: bind_tools
    definition: ChatModel に利用可能なツール群を結びつけるメソッド。これによりモデルは応答として tool_calls を返せるようになる。
  - term: ToolMessage
    definition: ツールの実行結果を LLM に返すためのメッセージ。tool call と対応づけて会話履歴に追加する。
---

## このセクションで学ぶこと

- LLM が直接ツールを実行するのではなく「呼び出し要求(tool call)」を返すことを理解する
- `bind_tools` でモデルにツールを渡し、`tool_calls` を受け取る流れを把握する
- 「要求 → 実行 → 結果をモデルに戻す」往復が必要なことを理解する

## LLM はツールを「実行しない」、呼び出しを「要求する」

Tool calling の最大のポイントは、**LLM 自身はツールを実行しない**ことです。LLM ができるのは「`get_weather` を `city="東京"` という引数で呼びたい」という **呼び出し要求(tool call)** を構造化データとして出力することだけです。実際に関数を動かすのは、私たちのアプリケーション側のコードです。

この役割分担は安全面でも重要です。LLM が勝手にコードを実行できると制御不能になりますが、「要求を返すだけ」なら、実行するかどうかをアプリ側が判断できます。

## bind_tools で渡し、tool_calls を受け取る

まず `bind_tools` でモデルに利用可能なツールを結びつけます。すると、モデルは質問に応じて「このツールを呼びたい」という `tool_calls` を返すようになります。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools([get_weather])

ai_msg = llm_with_tools.invoke("東京の天気を教えて")
print(ai_msg.tool_calls)
# [{'name': 'get_weather', 'args': {'city': '東京'}, 'id': 'call_abc123'}]
```

返ってきた `tool_calls` には、呼び出すツール名・引数・呼び出し ID が入っています。本文(`content`)は空のことが多く、この時点ではまだ天気の答えは得られていません。

## 結果をモデルに戻す「往復」

ツールの実行結果を会話に戻して、はじめて自然な回答が得られます。流れは「要求 → 実行 → 結果を `ToolMessage` で返す → 再度 invoke」という往復になります。

```python
from langchain_core.messages import HumanMessage, ToolMessage

messages = [HumanMessage("東京の天気を教えて")]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for call in ai_msg.tool_calls:
    result = get_weather.invoke(call["args"])  # アプリ側が実行
    messages.append(ToolMessage(result, tool_call_id=call["id"]))

final = llm_with_tools.invoke(messages)  # 結果を踏まえて回答
print(final.content)  # 「東京は晴れ、気温 22 度です。」
```

## 注意点: 一度の往復で終わるとは限らない

`tool_calls` は **複数同時に返る**ことがあります(並列ツール呼び出し)。また、ツール結果を見たモデルがさらに別のツールを呼びたくなることもあります。つまり「要求 → 実行 → 戻す」の往復は一度で終わるとは限りません。この往復を **自動で繰り返す**仕組みが、次のセクションで扱う Agent です。

## まとめ

- LLM はツールを実行せず、「どれを・どの引数で呼ぶか」の tool call を返すだけ。
- `bind_tools` でツールを渡し、`tool_calls` を受け取ってアプリ側が実行する。
- 実行結果は `ToolMessage` でモデルに戻す。この往復を繰り返すのが Agent。
