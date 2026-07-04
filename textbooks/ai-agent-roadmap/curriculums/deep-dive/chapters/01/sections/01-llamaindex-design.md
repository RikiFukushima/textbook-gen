---
section_id: "01-01"
chapter_id: "01"
title: LlamaIndex の設計思想 — なぜ Index 中心の抽象なのか
order: 1
estimated_minutes: 4
estimated_chars: 1637
learning_points:
  - LlamaIndex が「Index」を中心の抽象に置いた理由を説明できる
  - データ取り込み・索引化・検索・生成という 4 段階のパイプラインを把握する
  - LangChain との設計思想の違いを大まかに掴む
tags:
  - llamaindex
  - rag
  - architecture
related_sections:
  - "01-02"
  - "01-05"
key_terms:
  - term: Index
    definition: ドキュメント群を検索可能な形に整理した中間データ構造。LlamaIndex の中核抽象。
  - term: Ingestion Pipeline
    definition: 生データの読み込みからチャンク化・埋め込み・保存までを行う取り込み処理の流れ。
  - term: Query Engine
    definition: 検索と LLM 生成を組み合わせて回答を返す高レベルの実行単位。
---

## このセクションで学ぶこと

- LlamaIndex が「Index」を中心の抽象に置いた理由を説明できる
- データ取り込み・索引化・検索・生成という 4 段階のパイプラインを把握する
- LangChain との設計思想の違いを大まかに掴む

## なぜ Index が中心なのか

LlamaIndex は、その名のとおり **「Index」を最上位の抽象** に据えたフレームワークです。RAG を実装するとき、私たちは「ベクトル DB に投げて検索する」「結果を LLM に渡す」といった処理を書きがちですが、その手前には必ず **「どんな構造でデータを保持し、どんな粒度で問い合わせ可能にしておくか」** という設計判断が存在します。LlamaIndex はこの判断を Index という名前で前面に出すことで、RAG が「検索 + 生成」ではなく **「索引設計 + 問い合わせ」** であると思考の軸を変えてくれます。

具体的には、ドキュメントをそのまま並べた `SummaryIndex`、ベクトル化して類似検索する `VectorStoreIndex`、キーワードで引く `KeywordTableIndex`、木構造に要約をまとめた `TreeIndex` といった複数の Index タイプが用意されています。どれも「データをどう整理して問い合わせ可能にするか」のバリエーションです。基礎カリキュラム Ch03 で学んだ「RAG はベクトル検索が前提」という理解は出発点としては正しいのですが、実務では用途によって Index の形を選ぶ余地があると意識してください。

## 4 段階のパイプラインで考える

LlamaIndex のコードは、おおむね次の 4 段階に分解できます。

1. **Ingestion**: ファイルや API から `Document` を取り込む(この読み込み〜格納までの流れを LlamaIndex では **Ingestion Pipeline** と呼びます)
2. **Indexing**: `Document` を `Node`(チャンク)に分割し、埋め込みを付けて Index に格納する
3. **Retrieval**: クエリに対して Index から関連 Node を取り出す
4. **Synthesis**: 取り出した Node を LLM に渡して回答を組み立てる

最小コードで書くと、この 4 段階は次のように一行ずつ対応します。

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# 1. Ingestion
documents = SimpleDirectoryReader("./docs").load_data()

# 2. Indexing(Node 分割と埋め込みは内部で実行)
index = VectorStoreIndex.from_documents(documents)

# 3 + 4. Retrieval + Synthesis
query_engine = index.as_query_engine()
response = query_engine.query("RAG とは何ですか?")
```

このコードが綺麗に書けるのは、各段階を明確な抽象が担当しているからです。`Document` がデータの単位、`Index` が索引の単位、`Retriever` が検索の単位、`Response Synthesizer` が回答生成の単位、というように責務がきれいに分かれており、それぞれを差し替えて挙動を変えられます。

## LangChain との違い、そして注意点

LangChain は「LLM 呼び出しを **連鎖(Chain)** として組み立てる」ことに重きを置きます。一方 LlamaIndex は **データを索引として持ち続けること** に重きを置きます。同じ RAG を書いてもコードの主役が違うのです。LangChain では `Retriever` を作って Chain に渡す、という流れになりますが、LlamaIndex ではまず Index を組み立て、そこから Query Engine を派生させるという順番が自然です。

注意点として、`as_query_engine()` だけで動く手軽さの裏で **多くのデフォルト挙動が隠れている** ことを忘れてはいけません。チャンクサイズ、埋め込みモデル、Top-K、合成方式はすべて暗黙のデフォルト値で動いており、本番では明示的に指定する場面が必ず出てきます。次節以降では、その「隠れているもの」を一つずつ開いていきます。

## まとめ

- LlamaIndex は **Index を中心の抽象** に置き、RAG を索引設計の問題として捉え直す。
- Ingestion → Indexing → Retrieval → Synthesis の 4 段階で全体を見ると差し替えポイントが見える。
- 高レベル API は便利だが、デフォルト挙動が多いので本番では明示的に設定する。
