---
name: generate
description: 学習テーマを指定するだけで「雛形作成 → 骨子設計 → 本文生成 → クイズ生成 → 動画生成」を一気通貫で実行するオーケストレータ。ユーザーが「〇〇の教材を一気に作って」「〇〇を教材化して」「〇〇を全部まとめて作って」と言ったときに使う。各フェーズの実体は既存の init-textbook / outline / chapter / quiz / video の各スキル・エージェントに委譲する。
argument-hint: '"学習テーマ" [--slug slug] [--curriculum curriculum-id] [--level beginner|intermediate|advanced] [--hours N] [--chapters N] [--no-video]'
---

# generate — 一気通貫教材生成オーケストレータ

学習テーマを受け取り、**雛形作成 → 骨子設計 → 本文生成 → クイズ生成 → 動画生成** を順番に実行します。  
各フェーズの判断ルールは既存スキルに集約されているため、このスキルは **フェーズ間の制御と情報の橋渡し** だけを担います。

---

## 役割の境界

| フェーズ | 担当 |
|---|---|
| 情報収集・確認 | このスキル（AskUserQuestion） |
| 雛形作成 | `init-textbook` skill（= `npm run init-textbook`） |
| 骨子設計 | このスキルが直接 outline.yaml を生成（outline skill の処理を内包） |
| 本文生成 | `chapter-writer` agent を並列起動 |
| クイズ生成 | `quiz-writer` agent を並列起動 |
| 動画生成 | `video-script-writer` → `video-renderer` agent を順次起動 |

---

## フェーズ0: 事前確認（必須、スキップしない）

実行前に以下をすべて AskUserQuestion で確認する。全情報が揃ったら実行開始。

### 確認項目

| 項目 | デフォルト | 説明 |
|---|---|---|
| 学習テーマ | （必須・引数から取得） | 例:「AWS基礎」「LangChain入門」 |
| slug | テーマから自動生成（英小文字ハイフン） | 例: `aws-basics` |
| curriculum-id | `main` | 例: `intro`, `advanced` |
| 対象レベル | `beginner` | `beginner` / `intermediate` / `advanced` |
| 目標時間 | 2時間 | カリキュラム全体の目標学習時間（時間単位） |
| 章数 | 目標時間から自動計算（1章20分目安） | 例: 2時間 → 6章 |
| 動画生成 | する | `--no-video` オプションで省略可 |
| VOICEVOX確認 | — | 動画生成する場合のみ、`curl -s http://localhost:50021/version` で確認 |

情報が `$ARGUMENTS` から取れる場合は AskUserQuestion を省略してよい。不足分だけ聞く。

---

## フェーズ1: 雛形作成

確認した情報を使って init-textbook を実行する:

```bash
npm run init-textbook -- {slug} {curriculum-id} --title "{タイトル}" --curriculum-title "{カリキュラムタイトル}"
```

生成パスをユーザーに提示し、次フェーズに進む。

---

## フェーズ2: 骨子設計

outline.yaml と curriculum.yaml を生成する。**ユーザーとの往復は1回まで**（骨子案を提示してOKをもらったら即実行）。

### 骨子設計の判断基準（PHILOSOPHY §1・outline skill より）

- **広く浅く、重要概念だけ骨を通す**。完璧主義で挫折させない。
- セクションは1本3〜5分・1章20分目安。超えたら分割する。
- 章数 = 目標時間 ÷ 20分（四捨五入）。
- セクション数は章あたり3〜5本（カバレッジのためにセクションを盛らない）。
- 迷ったら削る。

### 出力するファイル

**`textbooks/{slug}/curriculums/{curriculum-id}/outline.yaml`**:
```yaml
title: "{カリキュラムタイトル}"
target_audience:
  level: "{beginner|intermediate|advanced}"
  prerequisites: []
  estimated_hours: {N}
style:
  tone: "conversational"
  code_examples: true
  diagram_default: "mermaid"
chapters:
  - id: "01"
    title: "{章タイトル}"
    estimated_minutes: 20
    learning_objectives:
      - "{学習目標1}"
      - "{学習目標2}"
    sections:
      - id: "01-01"
        title: "{セクションタイトル}"
        estimated_minutes: 4
      # ...
    quiz:
      count: 5
      difficulty: "easy"
  # ...
```

**`textbooks/{slug}/curriculums/{curriculum-id}/curriculum.yaml`**（章順を更新）:
```yaml
id: "{curriculum-id}"
title: "{カリキュラムタイトル}"
description: "{説明}"
order: 1
estimated_hours: {N}
target_audience:
  level: "{level}"
  prerequisites: []
chapter_order:
  - "01"
  - "02"
  # ...
```

骨子案をユーザーに提示し、修正があれば反映してから次フェーズに進む。  
**「OK」「大丈夫」「続けて」などの承認があれば即座に次フェーズへ進む。**

---

## フェーズ3: 本文生成

**1メッセージで全章の `chapter-writer` を並列起動する**（最大5章同時、超えるなら5章ずつバッチ）。

起動方法：subagent_type を `chapter-writer` として Agent ツールを呼ぶ。  
各エージェントの prompt に `slug` / `curriculum-id` / `chapter-id` を明示する。

例（6章の場合、2バッチ）:
```
バッチ1: ch01, ch02, ch03, ch04, ch05 を1メッセージで並列起動
バッチ2: ch06 を起動
```

各エージェントのサマリ（生成ファイルパス・セクション数・懸念）を表形式で集約してユーザーに提示する。

---

## フェーズ4: クイズ生成

本文生成が完了したら、**1メッセージで全章の `quiz-writer` を並列起動する**（最大5章同時）。

subagent_type を `quiz-writer` として Agent ツールを呼ぶ。  
各エージェントのサマリ（出力パス・問題数）を集約して提示する。

---

## フェーズ5: 動画生成

`--no-video` オプションが指定された場合はこのフェーズをスキップする。

### 5-1. VOICEVOXの起動確認

```bash
curl -s http://localhost:50021/version
```

応答がない場合はユーザーに起動を促す。確認できたら続行。

### 5-2. セクションリストの収集

`textbooks/{slug}/curriculums/{curriculum-id}/chapters/*/sections/*.md` を glob で全件列挙する。

### 5-3. 台本生成（video-script-writer を並列起動）

**3セクション同時を上限**として `video-script-writer` を並列起動する。

subagent_type を `video-script-writer` として Agent ツールを呼ぶ。  
各エージェントの prompt にセクションMDのパスを渡す。

全セクションの台本が揃ったら品質チェック（video-style §8）を行い、問題があれば該当セクションのみ再起動。

### 5-4. 音声生成・レンダリング（video-renderer を順次起動）

台本JSONごとに **1セクションずつシリアルで** `video-renderer` を起動する（VOICEVOXがシングルスレッドのため）。

subagent_type を `video-renderer` として Agent ツールを呼ぶ。  
各エージェントの prompt に台本JSONのパスを渡す。

---

## 完了サマリ

全フェーズ完了後、以下の表をユーザーに提示する:

| フェーズ | 状態 | 成果物 |
|---|---|---|
| 雛形 | ✅ | `textbooks/{slug}/` |
| 骨子 | ✅ | `outline.yaml` / `curriculum.yaml` |
| 本文 | ✅ | {N}章 {M}セクション |
| クイズ | ✅ | {N}章 × {P}問 |
| 動画 | ✅ / スキップ | {M}本 / (--no-video) |

ビューワーで確認するコマンドも提示する:
```bash
cd viewer && npm run dev
# → http://localhost:4001/textbooks/{slug}
```

---

## エラー時の対応

| エラー | 対応 |
|---|---|
| init-textbook失敗（スラッグ重複等） | エラー内容を提示してユーザーに確認 |
| chapter-writer一部失敗 | 失敗章を提示し、再実行するか確認 |
| VOICEVOX不応答 | 動画生成フェーズのみスキップして完了 |
| video-renderer失敗 | 失敗セクションを提示し、続行するか確認 |

---

## 注意事項

- 骨子はユーザーの確認後に本文生成を始める。本文生成後に骨子を変更するとファイルの不整合が起きるため、フェーズ2で骨子を確定させる。
- 動画生成は1セクション約3〜5分かかる。章あたり6セクションなら約18〜30分。大量の場合は先にテキスト教材だけ完成させてから動画を走らせる方が合理的。
- visibility は生成時 `private`（既定）のまま。公開する場合は `meta.yaml` を手動で変更する。
