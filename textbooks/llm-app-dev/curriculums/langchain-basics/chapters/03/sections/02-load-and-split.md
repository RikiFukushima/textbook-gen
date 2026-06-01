---
section_id: "03-02"
chapter_id: "03"
title: ドキュメントの取り込みと分割
order: 2
estimated_minutes: 5
estimated_chars: 973
learning_points:
  - Document Loader で多様な形式の文書を Document オブジェクトに取り込む流れを理解する
  - Text Splitter で文書を適切なチャンクに分割する理由と方法を説明できる
  - チャンクサイズとオーバーラップが検索品質に与える影響を理解する
tags:
  - Document Loader
  - Text Splitter
  - チャンク分割
related_sections:
  - "03-01"
  - "03-03"
key_terms:
  - term: Document Loader
    definition: PDFやWebページなど多様なソースを読み込み、LangChainのDocument形式に変換するコンポーネント。
  - term: Document
    definition: 本文(page_content)とメタデータ(metadata)を持つLangChainの文書表現。
  - term: Text Splitter
    definition: 長い文書を検索・処理しやすい小さなチャンクに分割するコンポーネント。
  - term: チャンク
    definition: 分割後の文書断片。検索とEmbeddingの最小単位になる。
  - term: チャンクオーバーラップ
    definition: 隣り合うチャンク同士で文章を一部重複させ、境界での文脈断絶を防ぐ設定。
---

## このセクションで学ぶこと

- Document Loader で多様な形式の文書を Document オブジェクトに取り込む流れを理解する
- Text Splitter で文書を適切なチャンクに分割する理由と方法を説明できる
- チャンクサイズとオーバーラップが検索品質に与える影響を理解する

## 文書を取り込む — Document Loader

RAG の最初のステップは、検索対象にしたい文書をプログラムから扱える形に読み込むことです。これを担うのが **Document Loader** です。PDF、テキスト、Markdown、Web ページ、Notion、CSV など、ソースごとに専用のローダーが用意されています。

ローダーが返すのは **Document** オブジェクトのリストです。Document は本文を表す `page_content` と、出典やページ番号などを保持する `metadata` を持ちます。このメタデータは後で「どの文書から引用したか」を示すのに役立ちます。

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("handbook.pdf")
docs = loader.load()  # List[Document] が返る
print(docs[0].page_content[:100])
print(docs[0].metadata)  # {'source': 'handbook.pdf', 'page': 0}
```

## なぜ分割するのか — Text Splitter

読み込んだ文書は、そのままでは検索に向きません。1 ファイルがまるごと 1 件だと、質問に関係するのは一段落だけでも文書全体がヒットしてしまい、無関係な部分まで LLM に渡すことになります。そこで文書を小さな塊に切り分けます。この処理が **Text Splitter**、切り分けた断片が **チャンク** です。

代表的な `RecursiveCharacterTextSplitter` は、段落・文・単語の区切りを優先しながら、指定した文字数を上限に分割します。

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 1チャンクの目安文字数
    chunk_overlap=50,      # 隣接チャンクと重ねる文字数
)
chunks = splitter.split_documents(docs)
```

`chunk_overlap` は隣り合うチャンクを少し重複させる設定で、文の途中で切れて文脈が断絶するのを防ぎます。取り込みから分割までの流れは次のとおりです。

```mermaid
flowchart LR
    Src[文書ソース] --> Load[Document Loader]
    Load --> Doc[Document リスト]
    Doc --> Split[Text Splitter]
    Split --> Chunk[チャンク群]
    Chunk --> Embed[Embedding へ]
```

## 注意点

チャンクサイズはトレードオフです。小さすぎると一つのチャンクに含まれる文脈が乏しくなり、大きすぎると検索でノイズが混ざり、コンテキスト長も圧迫します。対象文書の性質を見て調整するのが実務の勘所です。

## まとめ

- Document Loader はソースを Document(本文+メタデータ)に変換する
- Text Splitter は文書をチャンクに分割し、検索の最小単位を作る
- チャンクサイズとオーバーラップは検索品質を左右する重要なパラメータ
