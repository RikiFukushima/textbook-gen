# outline.yaml スキーマ

教材の骨子。`outline` skill が生成し、本文生成の **入力** として使う(本文の正本ではない)。全体仕様は [`textbook-gen-spec.md`](./textbook-gen-spec.md) を参照。

## 全体構造

```yaml
title: AWS SAA-C03 試験対策          # 教材タイトル
target_audience:
  level: 中級                        # 初級 | 中級 | 上級
  prerequisites:                     # 前提知識(箇条書き)
    - AWS の基本サービス(EC2, S3, VPC)を触ったことがある
  estimated_hours: 8                 # 想定総学習時間
style:
  tone: ですます調・実務寄り
  code_examples: true
  diagram_default: mermaid
sources:                             # 任意。外部参照を使った場合に記録
  - type: local_dir                  # local_dir | url | pdf
    path: ../my-project
  - type: url
    url: https://example.com/spec
chapters:
  - id: "01"                         # ゼロ埋め 2 桁
    title: AWS Well-Architected Framework
    estimated_minutes: 15            # 12-25 分(目安 15)
    learning_objectives:
      - 5 つの柱を説明できる
    sections:
      - id: "01-01"                  # {chapter_id}-{2桁節番号}
        title: フレームワークの概要
        estimated_minutes: 3         # 3-5 分目安
    diagrams:                        # 図解のヒント(reviewer の検証対象)
      - purpose: 5 つの柱の関係図
        type: mermaid
        section: "01-01"
    quiz:
      count: 10
      difficulty: medium             # easy | medium | hard
```

## フィールド一覧

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| `title` | ✓ | 教材タイトル |
| `target_audience.level` | ✓ | 初級 / 中級 / 上級 |
| `target_audience.prerequisites` | | 前提知識 |
| `target_audience.estimated_hours` | | 想定総学習時間。章合計とおおむね整合 |
| `style.tone` | ✓ | 本文トーン |
| `style.code_examples` | | コード例を含めるか |
| `style.diagram_default` | | 既定の図解記法(mermaid) |
| `sources[]` | | 外部参照。local_dir 利用時は meta に `contains_local_sources: true` |
| `chapters[].id` | ✓ | ゼロ埋め 2 桁 |
| `chapters[].estimated_minutes` | ✓ | 12-25 分 |
| `chapters[].sections[]` | ✓ | 章あたり 2-7(目安 3-5) |
| `chapters[].diagrams[]` | | 図解ヒント。`section` で配置先を指定 |
| `chapters[].quiz` | ✓ | count / difficulty |

## 命名規則

- `chapter_id`: `"01"`
- `section_id`: `"01-02"`(章番号 + 節番号)
- セクションファイル名: `02-{section-slug}.md`
