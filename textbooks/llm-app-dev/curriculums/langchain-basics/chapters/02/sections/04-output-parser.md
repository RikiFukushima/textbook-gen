---
section_id: "02-04"
chapter_id: "02"
title: OutputParserで出力を構造化する
order: 4
estimated_minutes: 5
estimated_chars: 1533
learning_points:
  - StrOutputParser で AIMessage から文字列を取り出せる
  - PydanticOutputParser などで LLM の出力を構造化データ(辞書・オブジェクト)に変換できる
  - パーサーを LCEL チェーンの末尾に置いて出力の形を揃える流れを把握する
tags:
  - langchain
  - output-parser
  - structured-output
  - lcel
related_sections:
  - "02-03"
  - "02-01"
key_terms:
  - term: OutputParser
    definition: LLM の出力(AIMessage や文字列)を、後続の処理で扱いやすい形(文字列・辞書・オブジェクトなど)に変換する Runnable。
  - term: StrOutputParser
    definition: AIMessage から本文テキストだけを取り出して文字列にする、もっとも基本的な OutputParser。
  - term: PydanticOutputParser
    definition: 期待する出力スキーマを Pydantic モデルで定義し、LLM 出力をそのオブジェクトに変換する OutputParser。
  - term: format_instructions
    definition: OutputParser が生成する「どんな形式で出力すべきか」をモデルに指示する文字列。プロンプトに埋め込んで使う。
---

## このセクションで学ぶこと

- StrOutputParser で AIMessage から文字列を取り出せる
- PydanticOutputParser などで LLM の出力を構造化データ(辞書・オブジェクト)に変換できる
- パーサーを LCEL チェーンの末尾に置いて出力の形を揃える流れを把握する

## なぜ OutputParser が要るのか

ChatModel の出力は `AIMessage` であり、本文は `.content` に入った **自由文の文字列** です。ところがアプリ側では、その出力を「画面に表示する文字列」として使いたいこともあれば、「`category` と `priority` を持つ辞書」のように **構造化データ** として後続処理に流したいこともあります。この **モデル出力を扱いやすい形に変換する役割** を担うのが `OutputParser` です。

前のセクションの `prompt | model | parser` で末尾に置いていた `parser` が、まさにこの OutputParser です。OutputParser も Runnable なので、チェーンの最後にパイプでつなぐだけで「出力の整形」をチェーンの一部に組み込めます。

## もっとも基本の StrOutputParser

いちばん使う頻度が高いのは `StrOutputParser` です。これは `AIMessage` を受け取り、`.content` の文字列だけを取り出します。これを末尾に置くと、チェーンの戻り値が `AIMessage` ではなく素の文字列になり、そのまま表示やログ出力に使えます。

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
text = chain.invoke({"question": "LangChain とは?"})
print(text)  # AIMessage ではなく文字列が返る
```

## 構造化データに変換する

「分類結果を JSON で受け取りたい」のように、出力を **プログラムで扱えるデータ構造** にしたい場合は、スキーマを定義できるパーサーを使います。`PydanticOutputParser` は、期待する形を Pydantic モデルで宣言し、LLM 出力をそのオブジェクトへ変換します。ポイントは、パーサーが生成する **format_instructions**(出力形式の指示文)をプロンプトに埋め込み、モデルに正しい形式で答えさせることです。

```python
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate

class Review(BaseModel):
    sentiment: str = Field(description="positive / negative のいずれか")
    score: int = Field(description="1〜5 の評価点")

parser = PydanticOutputParser(pydantic_object=Review)

prompt = ChatPromptTemplate.from_messages([
    ("system", "レビューを分類してください。\n{format_instructions}"),
    ("human", "{text}"),
]).partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser
result = chain.invoke({"text": "対応が早くて大満足でした"})
print(result.sentiment, result.score)  # Review オブジェクトとして取り出せる
```

`chain.invoke(...)` の戻り値は `Review` オブジェクトになり、`result.sentiment` のように属性アクセスできます。`get_format_instructions()` でモデルに出力フォーマットを伝え、パーサーがその出力を解釈してオブジェクトに戻す、という二人三脚の関係です。

## 注意点

OutputParser は「モデルがある程度フォーマットに従う」ことを前提にした **後処理** です。モデルが指示を無視して別の形で答えると、パースに失敗して例外になります。確実性を高めたいときは、`format_instructions` をプロンプトに必ず含める・`temperature` を低くする・最近のモデルが備える構造化出力機能(`with_structured_output`)を使う、といった対策が有効です。また、パーサーをチェーンに足すと戻り値の型が変わる(AIMessage → 文字列やオブジェクト)ので、その後ろにステップを足すときは入出力の型の噛み合わせに注意しましょう。

## まとめ

- OutputParser はモデルの出力を文字列や構造化データへ変換する Runnable で、チェーンの末尾に置く。
- StrOutputParser は AIMessage から文字列を取り出す最も基本のパーサー。
- PydanticOutputParser はスキーマを定義し、format_instructions と組み合わせて出力をオブジェクト化する。
