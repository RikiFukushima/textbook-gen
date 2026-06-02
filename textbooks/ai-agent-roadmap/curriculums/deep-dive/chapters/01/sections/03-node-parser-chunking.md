---
section_id: "01-03"
chapter_id: "01"
title: Node Parser とチャンキング戦略 — Sentence / Token / Semantic 分割
order: 3
estimated_minutes: 4
estimated_chars: 1515
learning_points:
  - 代表的な Node Parser(Sentence / Token / Semantic)の違いを説明できる
  - チャンクサイズとオーバーラップの設計指針を持てる
  - チャンキング戦略が検索精度に直結する理由を理解する
tags:
  - llamaindex
  - chunking
  - node-parser
related_sections:
  - "01-02"
  - "01-04"
key_terms:
  - term: Node Parser
    definition: Document を Node に分割する処理を担当するコンポーネント群。
  - term: chunk_size
    definition: 1 つの Node に含めるテキストの目安サイズ(トークンや文字単位)。
  - term: chunk_overlap
    definition: 隣接する Node 同士が共有するテキスト量。文脈の途切れを抑えるための重ね幅。
---

## このセクションで学ぶこと

- 代表的な Node Parser(Sentence / Token / Semantic)の違いを説明できる
- チャンクサイズとオーバーラップの設計指針を持てる
- チャンキング戦略が検索精度に直結する理由を理解する

## なぜチャンキングが精度を決めるのか

基礎カリキュラム Ch03 で触れたとおり、RAG の弱点の多くは **「ヒットした Node の中に答えが入っていない」** という形で現れます。Node の作り方が雑だと、答えに必要な情報が複数の Node に分散したり、逆に Node が大きすぎて検索の解像度が落ちたりします。Node Parser はその「どう切るか」を担う中心コンポーネントで、LlamaIndex は用途別に複数の実装を提供しています。

代表的なものは次の 3 つです。

- **SentenceSplitter**(既定): 文単位で区切りつつ、`chunk_size` に収まるよう束ねる。最も汎用で実務でも使う頻度が高い。
- **TokenTextSplitter**: トークン数を厳密に守って切る。LLM への入力長を厳密に管理したいときに有効。
- **SemanticSplitterNodeParser**: 埋め込みを使って **意味の切れ目** で分割する。長文や論文のように文体の切れ目と意味の切れ目が一致しない場面で効く。

## 具体例 — コードで比較する

最小コードで比較してみます。LlamaIndex 0.10 系の現行 import に揃えます。

```python
from llama_index.core.node_parser import (
    SentenceSplitter,
    TokenTextSplitter,
    SemanticSplitterNodeParser,
)
from llama_index.embeddings.openai import OpenAIEmbedding

# 1. 文単位で適度に束ねる(最も標準的な選択)
sentence_parser = SentenceSplitter(chunk_size=512, chunk_overlap=64)

# 2. トークン数を厳密に守る
token_parser = TokenTextSplitter(chunk_size=512, chunk_overlap=64)

# 3. 意味的な切れ目で分ける(埋め込みモデルが必要)
semantic_parser = SemanticSplitterNodeParser(
    buffer_size=1,
    breakpoint_percentile_threshold=95,
    embed_model=OpenAIEmbedding(),
)

nodes = sentence_parser.get_nodes_from_documents(documents)
```

実務での出発点は **SentenceSplitter で `chunk_size=512` 前後、`chunk_overlap` は `chunk_size` の 10〜20%** が無難です。`chunk_size` を大きくすると 1 つの Node に多くの文脈が入る代わりに検索の解像度が下がり、小さくすると解像度は上がるが文脈が途切れやすくなる、というトレードオフがあります。ドキュメントの密度(コード中心か散文中心か)によって適正値は変わるため、最終的にはサンプル質問で評価して調整します。

## 注意点 — 「とりあえず Semantic」は危険

Semantic Splitter は強力に見えますが、**埋め込み計算のコストが取り込み時に乗る** ことを忘れないでください。数万件の Document を取り込むなら、その回数だけ追加の埋め込み呼び出しが走ります。さらに、効果が出るのは「文体の切れ目と意味の切れ目がずれている文書」であって、構造化された Markdown や見出しが明確な技術文書では SentenceSplitter で十分な場合が多いです。

もう一つの注意は **オーバーラップを増やしすぎない** こと。オーバーラップは「答えが Node 境界をまたいだときの保険」ですが、過剰だと検索結果に同じ内容の Node が複数並び、LLM に渡るコンテキストが冗長になります。20% 程度を上限の目安にして、評価しながら調整してください。

最後に、Markdown や HTML のように **構造を持つ文書** には専用の Parser(`MarkdownNodeParser`、`HTMLNodeParser` など)があり、見出し階層に沿って Node を作れます。階層をメタデータに残せるため、後段で「見出しで絞り込む」検索もしやすくなります。

## まとめ

- Node Parser の選択は **検索精度と直結** する設計判断。
- 出発点は **SentenceSplitter + chunk_size 512 + overlap 10〜20%**、必要に応じて切り替える。
- Semantic Splitter は強力だが取り込みコストと適性を見極めて使う。
