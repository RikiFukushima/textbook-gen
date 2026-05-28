---
name: textbook-style
description: TextbookGen の教材生成・レビューで共通に守る執筆規約・スキーマ・命名・クイズ品質・正本ルールの正本(reference)。chapter-writer / quiz-writer / reviewer などの agent が起動時にプリロードして参照する。本文・問題・レビューの全工程で同じルールが適用される。
---

# textbook-style — 教材執筆規約の正本

ここは **TextbookGen の教材生成・レビューで守るルールの単一の正本(Single Source of Truth)** です。chapter-writer / quiz-writer / reviewer などの agent が起動時にこの内容をプリロードして参照します。**ルールを変えるときは必ずこのファイルだけを編集する**(他の skill / agent には同じ規約を二重に書かない)。

## 1. 階層と粒度

```
教材(Textbook)              最上位の保管単位(例: 「Git」「AI Agent ロードマップ」)
  └─ カリキュラム(Curriculum) 学習コース(例: 「基礎理解」)。1 教材に複数可
      └─ 章(Chapter)         12-25 分(目安 15 分 / 3-5 セクション)
          ├─ セクション × N    3-5 分(地の文+見出しで 1500-2000 字、下限 1200・上限 3000)
          └─ クイズ            4 択 × N(章単位)
```

- **textbook : curriculum = 1 : 多**。生成・閲覧・進捗はすべて curriculum 配下で完結する。
- **1 セクション = 1 ページ = 1 学習ユニット**(マイクロラーニング指向)。

## 2. ディレクトリ配置と命名

```
textbooks/{slug}/
  ├─ meta.yaml
  └─ curriculums/{curriculum-id}/
      ├─ curriculum.yaml
      ├─ outline.yaml
      ├─ chapters/{chapter-id}/
      │   ├─ chapter.yaml
      │   └─ sections/{2桁節番号}-{section-slug}.md
      └─ quizzes/{chapter-id}.json
```

- `slug`(教材)・`curriculum-id`: **英小文字・数字・ハイフン**(例 `"basics"` `"foundations"`)。
- `chapter_id`: **ゼロ埋め 2 桁**(`"01"`)。
- `section_id`: `{chapter_id}-{2桁節番号}`(`"01-02"`)。
- セクションファイル名: `{2桁節番号}-{section-slug}.md`(例 `02-security-model.md`)。

## 3. メタ情報の正本(source of truth)

| 情報 | 正本 |
| --- | --- |
| 教材全体メタ・カリキュラムの順序 | `meta.yaml`(`curriculum_order`) |
| カリキュラムメタ・章の順序 | `curriculums/{id}/curriculum.yaml`(`chapter_order`) |
| 章立ての構想(骨子) | `curriculums/{id}/outline.yaml`(生成の **入力のみ**。本文の正本ではない) |
| 章メタ・節の順序 | `chapters/{id}/chapter.yaml` |
| 節メタ(title, estimated_minutes 等) | section `.md` の frontmatter(**最優先**) |

**outline と frontmatter が食い違う場合は frontmatter を正とする**。

## 4. セクション本文

### 4.1 frontmatter(必須)

```yaml
---
section_id: "01-02"
chapter_id: "01"
title: ...
order: 2
estimated_minutes: 4
estimated_chars: 1800      # 実測値(地の文+見出し)
learning_points: [...]     # 3 個前後
tags: [...]
related_sections: [...]    # 前提・関連セクション(回遊・RAG のため)
key_terms:                 # 本文に**実際に登場する**語のみ
  - term: ...
    definition: ...
---
```

### 4.2 本文構成(3 層 + 前後パーツ)

1. `## このセクションで学ぶこと`(`learning_points` の箇条書き)
2. **本文 = 「概念 → 具体例 → 注意点」の 3 層構造**
3. 必要箇所に **Mermaid 図解**
4. `## まとめ`(3 行以内の箇条書き)

### 4.3 長さの目安と例外

- **目標 1500-2000 字**(地の文+見出し)。
- **下限 1200 / 上限 3000**。**2500 字超は警告**(reviewer が指摘)。
- 例外:
  - **概念導入**は 500-1000 字でも可。
  - **コード多め**(fenced コードブロックを **2 つ以上**含む)は **下限 800 字に緩和**(目標 1000-1500 字)。コード例が主役のため地の文を水増ししない。
  - **図解中心**は図の質を優先。

**字数カウントの基準**: `estimated_chars` は **本文の地の文 + 見出し**を数える(**frontmatter・コードブロック・Mermaid 図は除外**)。実測と乖離した値を申告しない。書き終えたら本文の概算字数を測定し、下限を満たすか確認してから frontmatter に記入する。

### 4.4 トーン

- **ですます調・実務寄り**(`meta.yaml` / `outline.yaml` の `style.tone` に従う)。
- 抽象論で終わらせず、具体例・実務での使いどころを必ず添える。

### 4.5 Mermaid 図解

- **Mermaid をデフォルト**とする。
- 用途別の使い分け:
  - **関係性** → `graph`
  - **順序・流れ** → `sequenceDiagram` / `flowchart`
  - **状態遷移** → `stateDiagram`
  - **データモデル** → `erDiagram`
- 複雑すぎて Mermaid で破綻する場合のみ別記法を検討(将来 D2)。

### 4.6 chapter.yaml

各章ディレクトリ直下の `chapter.yaml` には次を含める:

```yaml
id: "01"
title: ...
estimated_minutes: 20
learning_objectives: [...]
section_order:
  - "01-01"
  - "01-02"
  - ...
```

## 5. クイズ(4 択問題)

### 5.1 出力スキーマ

```json
{
  "chapter_id": "01",
  "questions": [
    {
      "id": "q01-01",
      "question": "...",
      "options": [
        { "id": "a", "text": "..." },
        { "id": "b", "text": "..." },
        { "id": "c", "text": "..." },
        { "id": "d", "text": "..." }
      ],
      "answer": "a",
      "explanation": "...",
      "source_refs": [{ "section_id": "01-01", "anchor": "本文の見出しや語句" }],
      "difficulty": "easy",
      "tags": ["..."]
    }
  ]
}
```

- 問題数・難易度は `outline.yaml` の章 `quiz`(count / difficulty)に従う。
- `id` は `q{chapter_id}-{2桁連番}`(`q01-03`)。

### 5.2 Distractor 戦略(品質の生命線)

- 初学者が混同しやすい概念を誤答に選ぶ。
- **「ほぼ正解だが部分的に違う」選択肢を 1 つは入れる**。
- **完全にランダム・無関係な誤答は不可**。
- 選択肢の長さ・粒度を揃え、正解だけ目立たないようにする。

### 5.3 source_refs

- **必ず付ける**。`section_id` + `anchor`(本文の見出しか特徴的な語句)で本文に紐づける。
- `anchor` は本文中に **実在する文字列**であること(grep で照合可能)。
- 将来の RAG 引用にも使う重要メタデータ。

## 6. レビュー観点(自己チェックと reviewer 共通)

### 6.1 セクション本文

- **学習目標との整合**: `learning_points` が本文で実際に扱われているか。
- **長さ**: §4.3 の範囲か。`estimated_chars` が実測と乖離していないか。
- **論理の飛躍**: 前提なしに専門用語・概念が登場していないか。
- **frontmatter**: `key_terms` が本文に登場するか、`section_id` / `order` が命名規則どおりか、`related_sections` が実在するか。
- **構成**: 「このセクションで学ぶこと」「概念 → 具体例 → 注意点」「まとめ」が揃っているか。

### 6.2 4 択問題

- **正解の一意性**: 正解が本当に 1 つだけか。他の選択肢が正解になり得ないか。
- **根拠**: `source_refs` の section_id / anchor が実在し、解説の根拠が本文にあるか。
- **distractor 品質**: ランダム・無関係な誤答がないか。「ほぼ正解」選択肢があるか。
- **形式**: 選択肢 4 つ、`answer` が options の id と一致、`id` が命名規則どおりか。

## 7. 安全

- ローカルディレクトリ参照を含む教材は `meta.yaml` に `contains_local_sources: true` を立て、誤公開を防ぐ。
- `meta.yaml` の `visibility` を勝手に `public` にしない(既定 `private`)。
