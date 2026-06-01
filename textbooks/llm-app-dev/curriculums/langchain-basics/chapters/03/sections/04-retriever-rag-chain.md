---
section_id: "03-04"
chapter_id: "03"
title: Retrieverを使ったRAGチェーン
order: 4
estimated_minutes: 6
estimated_chars: 1131
learning_points:
  - VectorStore から Retriever を取り出し、検索を Runnable として扱えることを理解する
  - 検索結果を文脈としてプロンプトに注入する RAG プロンプトを組み立てられる
  - retriever | prompt | model | parser を LCEL で連結して RAG チェーンを構成できる
tags:
  - Retriever
  - RAGチェーン
  - LCEL
related_sections:
  - "03-03"
  - "02-03"
key_terms:
  - term: Retriever
    definition: クエリを受け取り関連Documentを返す共通インターフェース。VectorStoreから取得できる。
  - term: RunnablePassthrough
    definition: 入力をそのまま下流に渡すRunnable。並列の片方で元の質問を保持するのに使う。
  - term: RunnableParallel
    definition: 複数のRunnableを並列実行し、結果を辞書にまとめるRunnable。
  - term: format_docs
    definition: 検索で得たDocumentリストを、プロンプトに差し込める1つの文字列に整形する関数。
---

## このセクションで学ぶこと

- VectorStore から Retriever を取り出し、検索を Runnable として扱えることを理解する
- 検索結果を文脈としてプロンプトに注入する RAG プロンプトを組み立てられる
- retriever | prompt | model | parser を LCEL で連結して RAG チェーンを構成できる

## 検索を部品にする — Retriever

ここまでで作った VectorStore を、チェーンに組み込める部品にします。`as_retriever()` を呼ぶと **Retriever** が得られます。Retriever は「クエリ文字列を受け取り、関連 Document のリストを返す」共通インターフェースで、第 2 章で学んだ Runnable の一種として `invoke` できます。つまり LCEL のパイプにそのままつなげます。

```python
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
docs = retriever.invoke("有休の申請方法")  # List[Document]
```

## 文脈を注入するプロンプト

検索で得た Document を、LLM が読める一つの文字列に整形し、プロンプトへ差し込みます。整形には小さな関数 `format_docs` を用意します。

```python
from langchain_core.prompts import ChatPromptTemplate

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

prompt = ChatPromptTemplate.from_template(
    "以下の資料だけを根拠に質問に答えてください。\n"
    "資料に無い場合は「わかりません」と答えてください。\n\n"
    "# 資料\n{context}\n\n# 質問\n{question}"
)
```

「資料に無いことは答えない」と明記するのが、ハルシネーションを抑える定石です。

## RAG チェーンを LCEL で組む

あとは検索・整形・プロンプト・モデル・パーサを一本のパイプにつなぎます。質問は二手に分かれ、片方は Retriever へ流して `context` に、もう片方は **RunnablePassthrough** でそのまま `question` に渡します。この並列を **RunnableParallel**(辞書記法)で表現します。

```python
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

answer = rag_chain.invoke("有休はどう申請しますか?")
```

入力の質問文字列は、`retriever | format_docs` を通って整形済み資料となり `context` に、`RunnablePassthrough` を通って元のまま `question` に入ります。両者が `prompt` で一つのメッセージに合成され、`model` が回答、`StrOutputParser` が文字列を取り出します。第 2 章の LCEL がそのまま RAG に応用できるわけです。

## 注意点

`k` を増やせば文脈は厚くなりますが、無関係なチャンクが混ざりノイズになることもあります。回答がズレるときは、まず検索結果(`retriever.invoke` の中身)を確認するのがデバッグの起点です。

## まとめ

- `as_retriever()` で得た Retriever は Runnable として LCEL に組み込める
- 検索結果は format_docs で整形し、context としてプロンプトに注入する
- retriever / passthrough を並列に置き、prompt | model | parser へつなげば RAG チェーンになる
