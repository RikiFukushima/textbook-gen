---
section_id: "04-01"
chapter_id: "04"
title: LangChain の歴史的役割と現在地 — 学習目的での使い方
order: 1
estimated_minutes: 4
estimated_chars: 1783
learning_points:
  - LangChain が登場した経緯と、何を「最初に揃えた」フレームワークだったか
  - 2025〜2026 年時点の LangChain の立ち位置(学習・プロトタイピング寄り)
  - 学習目的で使うときに見るべき範囲と、深追いしなくてよい範囲
tags:
  - langchain
  - framework
  - ecosystem
related_sections:
  - "04-02"
  - "04-03"
  - "05-01"
key_terms:
  - term: LangChain
    definition: LLM アプリケーションに必要な共通部品(プロンプト、モデル呼び出し、ツール、メモリ、Retriever など)を抽象化した Python/TypeScript のフレームワーク
  - term: Chain
    definition: 入力 → 出力の一方向の処理列を指す LangChain の中心概念。プロンプト整形 → LLM 呼び出し → 後処理のような直列構造に向く
  - term: LangChain エコシステム
    definition: LangChain 本体に加えて、LangGraph(状態機械)、LangSmith(観測)、LangServe(デプロイ)などを含む周辺ツール群の総称
---

# LangChain の歴史的役割と現在地 — 学習目的での使い方

## このセクションで学ぶこと

- LangChain が登場した経緯と、何を「最初に揃えた」フレームワークだったか
- 2025〜2026 年時点の LangChain の立ち位置(学習・プロトタイピング寄り)
- 学習目的で使うときに見るべき範囲と、深追いしなくてよい範囲

## なぜ LangChain は急速に広まったのか

LangChain が登場したのは 2022 年末です。ちょうど ChatGPT 公開直後、誰もが「LLM を自分のアプリに組み込みたい」と考え始めた時期でした。当時、開発者はモデル呼び出し・プロンプト管理・ツール呼び出し・会話メモリ・ベクトル検索といった部品を、毎回ゼロから書き直していました。LangChain はこれらを **共通の抽象**(`PromptTemplate` / `LLM` / `Tool` / `Memory` / `Retriever`)で揃え、「とりあえず LLM アプリを動かすまで」の距離を一気に縮めた点で歴史的役割が大きいフレームワークです。

特に強かったのが **ベンダー横断の抽象** です。OpenAI でも Anthropic でも、コードはほぼ同じ形で書ける。ベクトル DB も Pinecone / Chroma / pgvector を同じインタフェースで差し替えられる。前章までで触れた Retriever や Chunking といった概念の多くは、LangChain が広めた語彙でもあります。

## 2025〜2026 年の立ち位置 — 「学習・プロトタイピングのデファクト」

そこから 3 年経ち、LangChain の位置付けは少し変わりました。**Agent や複雑なワークフローを本番品質で動かす用途は、姉妹プロジェクトの LangGraph へ移っています**(理由は次節)。一方で、LangChain 本体は次のような用途で今も実質的なデファクトです。

- **学習・サンプル写経**: 書籍・チュートリアル・ドキュメントの量が圧倒的で、概念を素早く触るのに向きます。
- **プロトタイピング**: 「とりあえず RAG を動かしたい」「ツール呼び出しを試したい」のような検証で、最短距離を出してくれます。
- **小〜中規模の直列パイプライン**: プロンプト整形 → LLM → パース、のような **一方向の流れ** であれば、LangChain だけで十分きれいに書けます。

逆に、状態が分岐し、ループし、人間の承認が割り込み、途中で中断・再開する… といった **複雑な制御フロー** は LangChain の Chain 抽象では表現しにくく、ここから先は LangGraph に任せるのが現在の標準的な設計判断です。

## 学習目的でどこまで踏み込むか

LangChain の全機能を網羅しようとすると、抽象が多層で、似た名前のクラスもあり、消耗します。本書では次の方針を取ります。

- **入る範囲**: `PromptTemplate`、Chat モデル呼び出し、`Retriever`、`Tool`、そして次節以降で扱う **LCEL(LangChain Expression Language)** の基本記法。これは LangGraph を読む上でも頻出します。
- **深追いしない範囲**: 旧来の `LLMChain` / `AgentExecutor` / `ConversationalAgent` などの **レガシー Agent 機能**。これらは現在では LangGraph 側で書き直すのが推奨で、新規に学ぶ価値は薄くなっています。

注意したいのは、ネット上のサンプルコードには **旧 API と新 API(LCEL ベース)が混在** している点です。`chain.run(...)` のような呼び出しは旧 API、`chain.invoke(...)` / `chain.stream(...)` が現在の中心です。古い記事を読むときは、どちらの世代のコードかを意識すると混乱が減ります。

## まとめ

- LangChain は LLM アプリの「共通部品」を最初に揃えたフレームワークとして歴史的役割が大きい
- 現在(2025〜2026)は学習・プロトタイピング・直列パイプラインのデファクト、複雑な Agent は LangGraph へ
- 本書では LCEL の最小限と Retriever / Tool までを押さえ、旧 Agent 系には深入りしない
