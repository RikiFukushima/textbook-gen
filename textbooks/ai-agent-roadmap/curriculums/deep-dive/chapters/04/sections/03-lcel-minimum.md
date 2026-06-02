---
section_id: "04-03"
chapter_id: "04"
title: LangChain Expression Language (LCEL) の最小限の理解
order: 3
estimated_minutes: 4
estimated_chars: 1396
learning_points:
  - LCEL とは何か — pipe で部品を繋ぐ Runnable 合成の表記法
  - 最低限読めるようになる構文(invoke / stream / batch、`|` パイプ)
  - LCEL を学習対象として深追いしなくてよい理由
tags:
  - lcel
  - langchain
  - runnable
related_sections:
  - "04-01"
  - "04-02"
  - "05-01"
key_terms:
  - term: LCEL(LangChain Expression Language)
    definition: LangChain の部品(プロンプト、モデル、パーサー等)を `|` で繋いで合成するための DSL 風 API。すべての部品は Runnable インタフェースを実装している
  - term: Runnable
    definition: invoke / stream / batch の 3 メソッドを共通インタフェースとして持つ、LCEL の合成可能な実行単位
  - term: invoke / stream / batch
    definition: Runnable に共通する 3 つの呼び出し方。順に「1 件まとめて」「逐次ストリーミング」「複数件まとめて並列」
---

# LangChain Expression Language (LCEL) の最小限の理解

## このセクションで学ぶこと

- LCEL とは何か — pipe で部品を繋ぐ Runnable 合成の表記法
- 最低限読めるようになる構文(invoke / stream / batch、`|` パイプ)
- LCEL を学習対象として深追いしなくてよい理由

## LCEL は「Runnable を pipe で繋ぐ」だけの記法

LCEL は新しい言語ではなく、LangChain の部品を **`|` 演算子で連結する Python の書き方** にすぎません。プロンプトテンプレート、Chat モデル、出力パーサーなどはすべて **Runnable** という共通インタフェースを実装していて、Unix のパイプのように「左の出力を右の入力に流す」形で繋げます。

最小の例を 1 つだけ見ます。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    "次の文章を 1 行で要約してください。\n\n{text}"
)
model = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

chain = prompt | model | parser

print(chain.invoke({"text": "LCEL は Runnable を pipe で繋ぐ DSL です。..."}))
```

読み方はそのままで、`prompt | model | parser` は「テンプレートに値を埋め込み → モデルに渡し → 文字列として取り出す」という一直線の処理列を表します。これが LCEL の中心的な姿で、Chain 概念をコードで素直に表現したものだと捉えれば十分です。

## 覚えるのは 3 つのメソッドと 1 つの演算子だけ

LCEL を読むために最初に覚える要素は次の 4 つだけで足ります。

- `|` パイプ: 左の Runnable の出力を、右の Runnable の入力に流す
- `chain.invoke(input)`: 1 件入力して 1 件出力を取り出す(同期)
- `chain.stream(input)`: トークン単位の逐次出力をジェネレータで受け取る
- `chain.batch([input1, input2, ...])`: 複数件を並列に処理する

LCEL は他にも `RunnableParallel`(複数の Runnable を並列に走らせて辞書で受け取る)、`RunnablePassthrough`(入力をそのまま下流に流す)、`with_config`(タイムアウトやリトライ設定)などを持ちますが、これらは **必要になってから調べれば十分** です。LangGraph のコード中で LCEL の合成が出てきても、上記 4 つを押さえていればまず読めます。

## 深追いしないという判断

LCEL は便利ですが、本書のゴール(Agent 設計)に対しては **背景にあるツール** であって主役ではありません。深追いを避ける理由は 2 つあります。第 1 に、**Chain 内の分岐・ループは LangGraph 側で書くのが現在の推奨** で、LCEL に複雑な制御を詰め込む書き方は次第に廃れています。第 2 に、LCEL の応用機能(`RunnableBranch` での分岐、`RunnableLambda` での関数挿入など)は、LangGraph のノード/エッジで等価以上に表現できます。

つまり「LCEL は読めれば良く、複雑な制御は LangGraph で書く」という分担が、現状もっとも素直な学び方です。次章では、いよいよ LangGraph で Agent をステートマシンとして設計していきます。

## まとめ

- LCEL は Runnable(共通インタフェース)を `|` で繋ぐ、Chain のための合成記法
- `|` / `invoke` / `stream` / `batch` の 4 つを押さえれば、まず読める
- 複雑な制御は LCEL ではなく LangGraph に任せるのが現在の標準
