---
section_id: "01-04"
chapter_id: "01"
title: Retriever の種類と使い分け — Vector / Keyword / Hybrid
order: 4
estimated_minutes: 4
estimated_chars: 1513
learning_points:
  - Vector / Keyword / Hybrid の Retriever の違いを説明できる
  - それぞれが得意な質問パターンを判断できる
  - Top-K や閾値などの主要パラメータを把握する
tags:
  - llamaindex
  - retriever
  - hybrid-search
related_sections:
  - "01-02"
  - "01-05"
key_terms:
  - term: Retriever
    definition: クエリに対して Index から関連 Node を取り出す責務を持つコンポーネント。
  - term: Top-K
    definition: 検索結果として返す Node の上位件数。LLM に渡すコンテキスト量を決める主要パラメータ。
  - term: BM25
    definition: 単語頻度と文書長を考慮するキーワード検索の代表的なスコアリング手法。
---

## このセクションで学ぶこと

- Vector / Keyword / Hybrid の Retriever の違いを説明できる
- それぞれが得意な質問パターンを判断できる
- Top-K や閾値などの主要パラメータを把握する

## 3 種類の Retriever、それぞれの得意分野

LlamaIndex の Retriever は大きく分けて 3 種類あります。**Vector Retriever** はクエリを埋め込みベクトルに変換し、Index 内の Node ベクトルと類似度で比較します。**Keyword/BM25 Retriever** はクエリの単語と Node の単語の重なりをスコアリングします。**Hybrid Retriever** は両者を並行に走らせて結果をマージします。

それぞれの得意分野は次のように整理できます。

- **Vector**: 言い換えや意味的近さに強い。「動作が重い」と「パフォーマンスが悪い」を同じものとして扱える。
- **Keyword/BM25**: 固有名詞・型番・コマンド名のような **語そのものの一致** が決定的な場面で強い。`PostgreSQL` を「ポスグレ」と書かれても辞書なしでは引けない反面、`PostgreSQL` がそのまま含まれる Node を確実に拾える。
- **Hybrid**: 両者の弱点を補い合う。実務 RAG ではこれが既定の選択肢になりつつある。

「言い換え」と「固有名詞」のどちらが効くかは **対象ドキュメントとユーザー質問の性質次第** です。API リファレンスのようにメソッド名で引きたい用途は Keyword が効き、長文の解説記事から「要するに何の話?」と聞く用途は Vector が効きます。質問パターンが両方混じる現実のサービスでは Hybrid が安全です。

## 具体例 — Retriever の取り出し方

LlamaIndex 0.10 系では、Index から `as_retriever()` で Retriever を取り出すのが基本です。

```python
from llama_index.core import VectorStoreIndex
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.retrievers import QueryFusionRetriever

index = VectorStoreIndex.from_documents(documents)

# Vector Retriever(意味的な近さ)
vector_retriever = index.as_retriever(similarity_top_k=5)

# BM25 Retriever(キーワード一致)
bm25_retriever = BM25Retriever.from_defaults(
    docstore=index.docstore, similarity_top_k=5
)

# Hybrid(Reciprocal Rank Fusion でマージ)
hybrid_retriever = QueryFusionRetriever(
    [vector_retriever, bm25_retriever],
    similarity_top_k=5,
    num_queries=1,  # 質問を増やさない単純 Hybrid
    mode="reciprocal_rerank",
)

nodes = hybrid_retriever.retrieve("pgvector の HNSW インデックスの作り方は?")
```

主要なパラメータは **`similarity_top_k`** と **類似度の閾値** です。Top-K を増やせば取りこぼしは減りますが、ノイズも増えて LLM のコンテキストが汚れます。出発点は `top_k=5` 前後、回答品質と引き換えに調整するのが定石です。閾値(`similarity_cutoff`)は「これより類似度が低い Node は捨てる」ためのもので、ハルシネーション抑制に効きます。

## 注意点 — 単独で評価しない

3 種類どれを選ぶかは **必ず評価データセットで比較** してください。「Hybrid が無難」と書きましたが、ドキュメントの性質によっては Vector 単独の方がノイズが少なく性能が出ることもあります。最低限「想定質問 20〜50 件 + 正解 Node」をテストセットとして用意し、`Hit Rate@K` や `MRR(Mean Reciprocal Rank)` のような指標で比べる癖を付けると、勘ではなくデータで判断できるようになります。

もう一つの注意は **BM25 が日本語で素直に動かない** ことです。日本語は単語境界が空白で区切られないため、形態素解析や n-gram トークナイザを通す必要があります。`BM25Retriever` はデフォルトでは空白区切りを前提にすることが多いので、日本語ドキュメントに使う場合は事前のトークナイザ設定を確認してください。

## まとめ

- Vector・Keyword・Hybrid は **「何で引っかけたいか」** で選ぶ。
- 出発点は `top_k=5` 前後、評価データで Top-K と閾値を調整する。
- Hybrid は無難だが万能ではない。**評価して比較する** のが本道。
