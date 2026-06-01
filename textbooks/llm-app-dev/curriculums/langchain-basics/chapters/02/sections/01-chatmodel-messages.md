---
section_id: "02-01"
chapter_id: "02"
title: ChatModelとメッセージの扱い
order: 1
estimated_minutes: 4
estimated_chars: 1342
learning_points:
  - ChatModel が「メッセージのリスト」を入力に取り「メッセージ」を返すことを理解する
  - SystemMessage / HumanMessage / AIMessage の役割を区別できる
  - ChatModel を invoke して応答を取り出す基本的な書き方を身につける
tags:
  - langchain
  - chatmodel
  - message
related_sections:
  - "01-02"
  - "02-02"
key_terms:
  - term: ChatModel
    definition: メッセージのリストを入力に取り、1 件の応答メッセージを返す LangChain の抽象。OpenAI や Anthropic などの会話型 LLM をラップする。
  - term: SystemMessage
    definition: モデルの役割や振る舞いの方針を指示するメッセージ。会話の先頭に置くことが多い。
  - term: HumanMessage
    definition: ユーザーからの入力を表すメッセージ。
  - term: AIMessage
    definition: モデルが生成した応答を表すメッセージ。
---

## このセクションで学ぶこと

- ChatModel が「メッセージのリスト」を入力に取り「メッセージ」を返すことを理解する
- SystemMessage / HumanMessage / AIMessage の役割を区別できる
- ChatModel を invoke して応答を取り出す基本的な書き方を身につける

## ChatModel は「メッセージの列」を受け取る

現在の LLM アプリ開発では、単なる文字列を投げて文字列を受け取るのではなく、**役割(role)付きのメッセージのリスト**をやり取りするのが標準です。LangChain ではこの会話型モデルを `ChatModel`(チャットモデル)という抽象で扱います。`ChatModel` は **メッセージのリストを入力に取り、1 件の応答メッセージを返す** という、シンプルで一貫した約束を持っています。

なぜ「文字列」ではなく「メッセージのリスト」なのでしょうか。チャット型の LLM は、誰の発言か(システムの指示か、ユーザーの質問か、過去のモデルの返答か)を区別することで、文脈を正しく解釈し、指示への追従性を高められるからです。この役割の区別こそが、プロンプトの設計や会話履歴の管理を素直に表現できる土台になります。

## 3 種類のメッセージを使い分ける

LangChain でよく使うメッセージは次の 3 つです。

- **SystemMessage**: モデルの役割や口調、守るべき方針を与える指示。会話の先頭に置きます。
- **HumanMessage**: ユーザーからの入力(質問や依頼)。
- **AIMessage**: モデルが生成した応答。会話履歴を渡すときに使います。

実際にコードで書くと、次のように「システム指示」と「ユーザー入力」を並べてモデルに渡します。

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

messages = [
    SystemMessage(content="あなたは簡潔に答える技術アシスタントです。"),
    HumanMessage(content="LangChain の ChatModel とは何ですか?"),
]

response = model.invoke(messages)
print(response.content)  # 応答テキストを取り出す
```

`model.invoke(messages)` の戻り値は `AIMessage` です。本文テキストは `response.content` に入っており、文字列として取り出せます。会話を続けたい場合は、返ってきた `AIMessage` をリストに追加し、新しい `HumanMessage` をさらに足して再度 `invoke` すれば、過去のやり取りを文脈として渡せます。

## 注意点

入力として文字列をそのまま渡すこともできますが(`model.invoke("こんにちは")`)、内部的には `HumanMessage` 1 件に変換されるだけです。システム指示を効かせたい・会話履歴を扱いたい場合は、最初から **メッセージのリストで考える** 癖をつけると後で楽になります。また、`temperature` などのパラメータはモデル生成時に指定でき、`0` に近づけるほど出力が安定します。プロバイダ(OpenAI / Anthropic など)が違っても `ChatModel` の入出力の約束は共通なので、後からモデルを差し替えやすいのも利点です。

## まとめ

- ChatModel は「メッセージのリスト → 応答メッセージ」という一貫したインターフェースを持つ。
- System / Human / AI の 3 種類のメッセージで、指示・入力・履歴を表現する。
- `invoke` の戻り値は AIMessage で、本文は `.content` から取り出す。
