---
section_id: "05-03"
chapter_id: "05"
title: ベクトルストアの置き場所 — Supabase + pgvector
order: 3
estimated_minutes: 4
estimated_chars: 943
learning_points:
  - RAG 用のベクトルストアを Supabase + pgvector に置く構成を確認する
  - 専用ベクトルDBを別立てせず、既存の Postgres にベクトルを同居させる利点を押さえる
  - この surface は既知の技術で新規学習がほぼないため、おさらいとして軽く通す
tags: [インフラ, supabase, pgvector, rag, ベクトル検索]
related_sections: ["05-01", "05-02", "05-04"]
key_terms:
  - term: pgvector
    definition: PostgreSQL にベクトル型と類似度検索を追加する拡張。通常のテーブルと同じDBの中でベクトル検索ができる。
  - term: Supabase
    definition: PostgreSQL をベースにしたマネージドなバックエンドサービス。pgvector を有効にしてベクトルストアとして使える。
---

## このセクションで学ぶこと

- RAG 用のベクトルを Supabase + pgvector に置く構成
- 専用ベクトルDBを別立てしないことの利点
- ここは既知の技術なので、おさらいとして軽く通す

## ここは新規学習ほぼゼロ、おさらいでよい

4つの surface のうち、ベクトルストアは**すでに知っている技術で足りる**面です。前提知識として Supabase(pgvector)を触ったことがあるので、ここは構成の確認だけで済みます。深追いは不要です。

タイプ3の agent では、ナレッジ(FAQ・過去チケット・マニュアルなど)を埋め込みベクトルにして保存し、チケット本文と近いものを検索して LLM に渡します。この「ベクトルの保管と検索」を担うのがベクトルストアです。

## Supabase + pgvector に同居させる

置き場所は **Supabase + pgvector** です。ポイントは、専用のベクトルDBを新たに立てず、**Postgres の中にベクトルを同居させる**ことです。

- **pgvector** は PostgreSQL の拡張で、ベクトル型のカラムと類似度検索(近傍検索)を追加します。
- **Supabase** はその Postgres をマネージドで提供するので、拡張を有効にするだけでベクトルストアになります。

これにより、`ticket_id` やナレッジのメタデータといった通常のカラムと、ベクトルを**同じテーブル/同じDBで扱える**のが効いてきます。別サービスを増やさない分、構成がシンプルになり、運用対象も減ります。

## 注意点 — 規模が出たら見直す面はある

pgvector は小〜中規模のプロトタイプでは十分ですが、ベクトル件数が非常に大きくなると検索性能のためにインデックス設計を見直す場面が出てきます。ただしそれは今回のスコープの外です。まずは「Supabase の Postgres に pgvector で同居」という最小構成を押さえておけば、この surface は通ります。

## まとめ

- ベクトルストアは Supabase + pgvector。既知の技術でおさらいでよい。
- 専用ベクトルDBを別立てせず、Postgres にベクトルを同居させる。
- 大規模化時のインデックス最適化は今回のスコープ外。
