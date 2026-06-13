---
name: video-style
description: TextbookGen のショート動画生成で共通に守るルール・スキーマ・台本フォーマット・音声・アニメーション仕様の正本(SSOT)。video-script-writer / video-renderer などのエージェントが起動時にプリロードして参照する。ルールを変えるときはこのファイルだけを編集する。
---

# video-style — ショート動画生成規約の正本

ここは **TextbookGen のショート動画生成で守るルールの単一の正本(Single Source of Truth)** です。エージェントは起動時にこの内容をプリロードして参照します。**ルールを変えるときは必ずこのファイルだけを編集する**。

---

## 1. 動画スペック

| 項目 | 値 |
|---|---|
| 解像度 | 1080 × 1920 px（縦型ショート） |
| FPS | 30 |
| 形式 | MP4 |
| 目標尺 | **30〜45 秒**（音声実尺の合計で管理） |
| 尺の上限 | 60 秒（超えたら台本を削る） |

---

## 2. シーン構成（必ず守る）

**5シーン固定構成**:

```
cover(1) → point(3) → hook(1)
```

| kind | 役割 | 尺の目安 |
|---|---|---|
| `cover` | 問いかけ・掴み。視聴者が「自分ごと」と感じる問いで始める | 5〜8 秒 |
| `point` × 3 | 学習内容本体。1シーン1メッセージ。図解付き可 | 5〜13 秒 |
| `hook` | 問いで締めてCTAへ誘導。「本文で確かめる」 | 4〜7 秒 |

---

## 3. 台本フォーマット（ScriptData JSON）

```jsonc
{
  "title": "セクションタイトル",
  "source": "textbooks/{slug}/curriculums/{id}/chapters/{ch}/sections/{file}.md",
  "scenes": [
    {
      "kind": "cover",
      "caption": "表示テキスト\n（\\nで改行可）",
      "narration": "ずんだもんが読み上げる話し言葉。カタカナ変換前の生テキスト。",
      "durationSec": 0         // 音声生成後に実尺で上書きする（生成前は 0 のまま）
    },
    {
      "kind": "point",
      "label": "ラベル文字列",   // PointSceneの上部に表示するキーワード
      "caption": "表示テキスト",
      "narration": "話し言葉",
      "durationSec": 0,
      "diagram": "comparison"  // オプション: comparison / flow / versus / none
    },
    // point × 3 ...
    {
      "kind": "hook",
      "caption": "続きは本文で。",
      "narration": "問いかけ + CTAの話し言葉",
      "durationSec": 0
    }
  ]
}
```

### caption の書き方ルール

- **20文字以内**を目安。長い場合は `\n` で2行に分割する
- 体言止め・短いフレーズで。文章にしない
- 英字はそのまま書いてよい（表示用なので変換不要）

### narration の書き方ルール

- **ずんだもん口調**（「〜なのだ」「〜のだ」で締める）
- 英字・略語はそのまま書く（`normalize-narration.ts` が自動変換する）
- 1シーン = 1〜3文。長くなりすぎない（音声が長いとテンポが崩れる）
- **coverは「問いかけ」から始める**（「〜って知ってる？」「〜で困ったことない？」）
- **hookは問いで締める**（「あなたの〜はどの型なのだ？」）

### diagram の選び方

| 値 | 使う状況 |
|---|---|
| `comparison` | 「誤解 vs 実際」「旧手法 vs 新手法」の2項対比 |
| `flow` | 手順・パイプライン・ステップの連鎖（3〜5ステップ） |
| `versus` | ツール・概念・アプローチの横断比較（2〜3列） |
| `none` | 図解不要。テキストだけで伝わるシーン |

---

## 4. 音声仕様

- エンジン: **VOICEVOX**（localhost:50021）
- キャラクター: **ずんだもん ノーマル**（speaker=3）
- speedScale: **1.15**、intonationScale: **1.1**
- 辞書: `scripts/poc-video/tts-dict.json`（SSoT）
  - 変換は `normalize-narration.ts` が自動適用
  - 新しい技術用語を追加するときは辞書に追記してから音声生成する
- 出力先: `scripts/poc-video/remotion/public/{section-id}/voice-0N.wav`
- クレジット表記: **「VOICEVOX:ずんだもん」**（動画概要欄などに必ず記載）

---

## 5. アニメーション仕様

### 使用するイージング（`easing.ts` の関数のみ）

| 関数 | 使う場面 |
|---|---|
| `easeOutExpo` | テキストフェードイン・ラインのスライド・標準的な登場 |
| `easeOutBack` | カード・バッジのスケールイン（軽い射出感） |
| `easeOutElastic` | 強調したい要素の登場（`?`マーク・アイコンなど） |
| `easeOutBounce` | 原則使わない（ゲームっぽくなるため） |

### テキスト登場パターン

- **タイプライター**: `QuestPointScene` のキャプション（1文字ずつ出現）
- **フェード+スライドアップ**: `QuestCoverScene` のサブテキスト
- **clip-path左→右**: 旧Chalk系（現在は非推奨）

### 禁止事項

- `Math.random()` / `Date.now()` / `new Date()` の使用（Remotionの制約）
- `easeOutBounce` の使用（ゲームUI感が出る）
- ゲームUI要素（XP・STAGE・POINT・レベルアップ演出など）

---

## 6. ファイル構成

```
scripts/poc-video/
├── remotion/
│   ├── src/
│   │   ├── Root.tsx                  ← Composition登録・台本・音声パス定義
│   │   ├── QuestComposition.tsx      ← メインのComposition
│   │   ├── easing.ts
│   │   ├── types.ts
│   │   ├── scenes/quest/             ← Cover / Point / Hook シーン
│   │   └── diagrams/quest/           ← Comparison / Flow / Versus 図解
│   └── public/
│       └── {section-id}/             ← セクションごとの音声ファイル
│           ├── voice-00.wav
│           ├── voice-01.wav
│           └── ...
├── scripts/
│   └── {section-id}.json             ← 台本JSON（生成物）
├── gen-voice.ts                      ← 音声生成スクリプト
├── normalize-narration.ts            ← TTS正規化
└── tts-dict.json                     ← 変換辞書（SSoT）
```

### 出力先ルール

**最終MP4は教材ディレクトリのセクションと同階層に配置する**:

```
textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/
├── 01-llamaindex-design.md      ← テキスト本文
└── 01-llamaindex-design.mp4     ← 動画（MDと同名・同階層）
```

- ファイル名はセクションMDと**同じsection-slug**を使う（拡張子だけ `.mp4`）
- MDと1対1で対応するため、命名がずれないよう `source` フィールドから導く
- 中間生成物（台本JSON・音声wav）は `scripts/poc-video/` に置いたまま。教材リポジトリには最終MP4だけを入れる

---

## 7. 開発フロー（1セクション分）

```
1. セクションMD を読んで台本JSON を生成（video-script-writer agent）
2. tts-dict.json に未登録の技術用語があれば追記
3. gen-voice.ts で音声生成 → public/{section-id}/ に配置
4. ffprobe で実尺計測 → 台本JSONの durationSec を更新
5. Root.tsx に台本データ・音声パスを登録
6. remotion still でフレームキャプチャして目視確認（5フレーム）
7. remotion render で動画出力
8. MP4 を sections/ 配下に配置（MDと同名・同階層）
```

---

## 8. 台本品質チェックリスト

台本JSON生成後、以下を確認する:

- [ ] 5シーン構成（cover × 1, point × 3, hook × 1）になっているか
- [ ] coverが「問いかけ」から始まっているか
- [ ] 各pointのcaptionが20文字以内か
- [ ] narrationがずんだもん口調（「〜なのだ」）か
- [ ] hookが問いで締まっているか
- [ ] 全シーンの narration 合計が 30〜45 秒相当か（目安: 1秒 = 5〜6文字）
- [ ] セクションMDの `learning_points` がすべてpoint3シーンにカバーされているか
- [ ] 誤解→逆転の構造が少なくとも1シーンに入っているか

---

## 9. 安全・クレジット

- VOICEVOX使用時は必ず「VOICEVOX:ずんだもん」をクレジット表記する
- `visibility` を勝手に `public` にしない（動画も同様）
- `contains_local_sources: true` なセクションから作った動画は非公開にする
