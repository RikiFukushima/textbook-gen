---
section_id: "03-02"
chapter_id: "03"
title: pgvector の特徴と適用範囲 — PostgreSQL でベクトルを扱う
order: 2
estimated_minutes: 4
estimated_chars: 1835
learning_points:
  - pgvector が「PostgreSQL の拡張」であることの意味と利点
  - HNSW / IVFFlat インデックスの違いと選び方
  - 「既存基盤に乗せる」適用範囲と限界
tags:
  - vector-db
  - pgvector
  - postgresql
related_sections:
  - "03-01"
  - "03-03"
  - "03-04"
key_terms:
  - term: pgvector
    definition: PostgreSQL にベクトル型と最近傍探索演算子を追加する拡張機能
  - term: IVFFlat
    definition: IVF を Flat(量子化なし)で実装した pgvector の index 種別。学習が必要だが軽量
  - term: HNSW(pgvector)
    definition: pgvector 0.5 以降で利用できるグラフ系 index。精度・速度ともに高いがメモリ消費が大きい
---

# pgvector の特徴と適用範囲 — PostgreSQL でベクトルを扱う

## このセクションで学ぶこと

- pgvector が「PostgreSQL の拡張」であることの意味と利点
- HNSW / IVFFlat インデックスの違いと選び方
- 「既存基盤に乗せる」適用範囲と限界

## pgvector は「DB を増やさない」という選択肢

ベクトル DB の文脈で最初に検討に値するのが **pgvector** です。これは独立した製品ではなく、**PostgreSQL の拡張機能** として動きます。`CREATE EXTENSION vector;` を一度実行すれば、既存のテーブルに `vector(1536)` のようなカラムを足せます。最近傍探索は `ORDER BY embedding <-> '[...]'::vector LIMIT 10` のような SQL で書けます。

pgvector が選ばれる最大の理由は、**新しいインフラを増やさずに済む** ことです。多くの組織はすでに PostgreSQL を本番運用しており、バックアップ・監視・権限管理・コネクションプール・マイグレーションの仕組みが揃っています。専用のベクトル DB を導入すると、これらを全部もう一度組み直すことになります。pgvector ならその工数を回避できます。

加えて、**SQL のフィルタとベクトル検索を 1 クエリで書ける** のも大きな利点です。「2024 年以降に作成された、ユーザー A がアクセス可能な、質問に意味的に近いドキュメントを 10 件」といった要件を、JOIN と WHERE と `<->` 演算子の組み合わせで自然に表現できます。専用ベクトル DB だとメタデータフィルタの表現力に制約がある場合があり、ここは pgvector の強みです。

## インデックスの選び方 — IVFFlat か HNSW か

pgvector は最近傍探索を高速化する index を 2 種類提供しています。

```sql
-- IVFFlat: lists 数で精度・速度のバランスを取る
CREATE INDEX ON docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- HNSW: pgvector 0.5 以降。m と ef_construction でグラフの密度を決める
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

**IVFFlat** は前節で見た IVF の素朴な実装で、**事前にデータを学習してクラスタを作る** 必要があります。データ分布が変わると再構築の効果が大きい一方、構築自体は軽量です。データが少ない段階で作ると lists 数が適切にならず、後でやり直すことになりがちなので、ある程度データが溜まってから index を張るのが定石です。

**HNSW** は新しめの選択肢で、IVFFlat より **精度と速度のバランスに優れる** 一方、**メモリ消費が大きい** のが弱点です。クエリ時には `SET hnsw.ef_search = 40` のようにグラフ探索の幅を調整して、リコールとレイテンシを微調整します。新規プロジェクトなら、まず HNSW から試すのが無難でしょう。

## 適用範囲と限界 — どこまでなら pgvector で押せるか

pgvector は万能ではありません。次のような目安で「向き・不向き」を捉えておきましょう。

- **向いている**: 数百万ベクトル以下、既存の PostgreSQL に乗せたい、メタデータフィルタが複雑、トランザクションと整合させたい
- **要検討**: 数千万〜億ベクトル規模、ベクトル検索の QPS が極端に高い、ベクトル専用のレプリカ構成にしたい

数千万を超えると、HNSW の index がメモリに乗り切らず性能が劣化する事例が増えてきます。書き込みが多い系では、HNSW index の更新コストが書き込みレイテンシを押し上げることもあります。

pgvector のもう一つの注意点は、**他の機能(全文検索・GIN index など)との競合**です。同じテーブルで全文検索とベクトル検索を併用するとプランナの判断が難しくなり、想定外の実行計画になることがあります。Hybrid Search を本気でやるなら、検索専用のテーブルやマテリアライズドビューに切り出すなどの工夫が要ります。

要するに pgvector は「**専用品ほど尖ってはいないが、既存の運用とよく馴染む**」選択肢です。中規模までの RAG では十分に主力になりますし、大規模化したときに専用品へ移行する判断も含めて、最初の足場として優秀です。

## まとめ

- pgvector は PostgreSQL 拡張なので、既存の運用・バックアップ・権限の仕組みに乗せられる
- index は IVFFlat と HNSW の 2 択。新規なら HNSW、データ分布に変動があるなら IVFFlat
- 中規模(数百万ベクトル)までが快適。億単位や極端な QPS では専用品の検討が必要
