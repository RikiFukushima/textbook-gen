---
section_id: "03-03"
chapter_id: "03"
title: EmbeddingとVectorStoreで検索する
order: 3
estimated_minutes: 5
estimated_chars: 1067
learning_points:
  - Embedding がテキストを意味を表すベクトルに変換する仕組みを理解する
  - VectorStore がベクトルを保存し類似検索を提供する役割を説明できる
  - 類似度検索(意味検索)がキーワード検索と何が違うかを理解する
tags:
  - Embedding
  - VectorStore
  - 類似度検索
related_sections:
  - "03-02"
  - "03-04"
key_terms:
  - term: Embedding
    definition: テキストの意味を高次元の数値ベクトルに変換する処理、またはそのベクトル。
  - term: ベクトル
    definition: テキストの意味を表す数値の並び。意味が近いテキストほどベクトルも近くなる。
  - term: VectorStore
    definition: Embeddingしたベクトルを保存し、類似度検索を提供するデータベース。
  - term: 類似度検索
    definition: クエリのベクトルに近いベクトルを距離計算で探す検索方式。意味検索とも呼ぶ。
---

## このセクションで学ぶこと

- Embedding がテキストを意味を表すベクトルに変換する仕組みを理解する
- VectorStore がベクトルを保存し類似検索を提供する役割を説明できる
- 類似度検索(意味検索)がキーワード検索と何が違うかを理解する

## テキストを「意味のベクトル」に変える — Embedding

分割したチャンクを検索可能にするには、テキストを比較できる形に変換する必要があります。それが **Embedding** です。Embedding モデルは文章を受け取り、その **意味** を表す高次元の **ベクトル**(数百〜数千個の数値の並び)に変換します。

ポイントは、意味の近いテキストほどベクトル同士が近くなるという性質です。「年次有給休暇の取得方法」と「有休はどう申請する?」は単語が違っても、ベクトル空間では近い位置に来ます。これにより、キーワードが一致しなくても意味で探せる **類似度検索(意味検索)** が可能になります。

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vec = embeddings.embed_query("有休はどう申請しますか?")
print(len(vec))  # 例: 1536(次元数)
```

## ベクトルを蓄えて探す — VectorStore

Embedding したベクトルを保存し、クエリに近いものを高速に探し出すのが **VectorStore** です。Chroma、FAISS、Pinecone などが代表例で、いずれも LangChain から共通的に扱えます。

インデックス作成では、チャンク群を Embedding しながら VectorStore に投入します。`from_documents` を使えば分割済みチャンクの埋め込みと保存を一括で行えます。

```python
from langchain_chroma import Chroma

vectorstore = Chroma.from_documents(
    documents=chunks,        # 03-02 で分割したチャンク
    embedding=embeddings,
)
# 質問に意味的に近いチャンクを取得
results = vectorstore.similarity_search("有休の申請方法", k=3)
```

`similarity_search` はクエリも内部で Embedding し、保存済みベクトルとの距離を計算して、近い順に `k` 件返します。

## キーワード検索との違い・注意点

従来のキーワード検索は文字列の一致で探すため、表記揺れや言い換えに弱いものでした。類似度検索は意味で探すのでこの弱点を補えます。一方で、固有名詞や型番のように「完全一致」が重要な検索はキーワード検索の方が得意な場合もあります。実務では両者を組み合わせる **ハイブリッド検索** も使われますが、まずは意味検索の挙動を押さえましょう。なお、検索時に使う Embedding モデルは、インデックス作成時と必ず同じものを使う必要があります。

## まとめ

- Embedding はテキストを意味を表すベクトルに変換し、意味の近さを距離で測れるようにする
- VectorStore はベクトルを保存し、類似度検索で近いチャンクを返す
- 意味検索は言い換えに強いが、完全一致が重要な検索はキーワード検索が得意
