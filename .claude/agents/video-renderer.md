---
name: video-renderer
description: 台本JSON(ScriptData)を受け取り、音声生成→durationSec書き戻し→Root.tsx再生成→Remotionレンダリングまでを一気通貫で実行するエージェント。1セクション = 1エージェントの粒度。音声スペック・ファイル構成ルールはプリロードされたvideo-styleを参照する。
tools: Read, Write, Edit, Bash
skills:
  - video-style
---

# video-renderer — 音声生成・レンダリングエージェント

台本JSONを受け取り、**音声生成 → 実尺計測 → durationSec書き戻し → Root.tsx再生成 → Remotionレンダリング**  
までを一気通貫で実行します。ファイル構成・音声スペックはプリロードされた **video-style** が正本です。

---

## 入力（親から受け取る）

- `script-json`: 台本JSONのパス（例: `scripts/poc-video/scripts/01-01.json`）

このパス1つだけで自走できる。

---

## 出力

```
scripts/poc-video/remotion/public/{section-id}/voice-0N.wav        ← 音声ファイル（中間生成物）
scripts/poc-video/scripts/{section-id}.json                        ← durationSec更新済み台本（中間生成物）
textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/{section-slug}.mp4  ← 最終動画
scripts/poc-video/remotion/review-frames/{section-id}-frame-NNN.png ← 確認用フレーム(5枚、一時ファイル)
```

**最終MP4はセクションMDと同じディレクトリ・同じslugで配置する**:
```
sections/
├── 01-llamaindex-design.md   ← 既存のテキスト本文
└── 01-llamaindex-design.mp4  ← 生成する動画（拡張子だけ変える）
```

---

## 手順

### 1. 台本JSONを読む

`script-json` のパスを Read し、以下を確認する:

- `section_id`（音声ディレクトリ名に使う）
- `source`（`textbooks/...` のパス。最終MP4の配置先を導く）
- `scenes` の `narration` が全シーンに入っているか

`source` から以下を抽出する:
```
textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/{section-slug}.md
                                                                              ↑ この slug を MP4 のファイル名に使う
```

例: `source` が `textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/01-llamaindex-design.md` なら
- slug = `01-llamaindex-design`
- 最終MP4 = `textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/01-llamaindex-design.mp4`

### 2. VOICEVOXの起動確認

```bash
curl -s http://localhost:50021/version
```

応答がない場合はエラーを返して終了する（親に伝える）。

### 3. 音声ファイルの出力先ディレクトリを作成

```bash
mkdir -p scripts/poc-video/remotion/public/{section-id}
```

### 4. 音声生成

`scripts/poc-video/gen-voice.ts` を呼び出す（リポジトリルートから実行）:

```bash
npx tsx scripts/poc-video/gen-voice.ts \
  {script-json-path} \
  scripts/poc-video/remotion/public/{section-id}
```

`gen-voice.ts` は内部で `normalizeNarration` を適用するため、narrationの英字は変換しなくてよい。

### 5. 実尺計測・durationSec 書き戻し

生成されたwavファイルの実尺を計測し、台本JSONを更新する:

```bash
ffprobe -v quiet -show_entries format=duration -of csv=p=0 \
  scripts/poc-video/remotion/public/{section-id}/voice-0N.wav
```

計測した値（小数点2桁に丸める）を台本JSONの各シーンの `durationSec` に書き戻す。

**合計尺の確認**: 全シーンの `durationSec` の合計が **60秒を超える場合は親に報告**して確認を取る（超えても続行はできるが品質に影響する）。

### 6. Root.tsx の再生成

Root.tsx を直接編集するのではなく、`gen-root.ts` を使って **scripts/ の全JSONから Root.tsx を自動再生成** する（リポジトリルートから実行）:

```bash
npx tsx scripts/poc-video/gen-root.ts
```

このスクリプトは:
- `scripts/poc-video/scripts/*.json` を全件スキャン
- 音声ファイルの存在も自動検出
- Root.tsx を丸ごと再生成（手動追記・競合なし）

**Root.tsx を直接編集しないこと。** gen-root.ts が自動管理する。

### 7. TypeScriptエラー確認

```bash
cd scripts/poc-video/remotion && npx tsc --noEmit
```

エラーがある場合は `gen-root.ts` に問題がある可能性が高い。親に報告する。

### 8. フレームキャプチャ（5フレーム）

Compositionの総フレーム数から均等に5フレームを選んでキャプチャする（remotion/ ディレクトリから実行）:

```bash
mkdir -p scripts/poc-video/remotion/review-frames

node_modules/.bin/remotion still src/Root.tsx QuestVideo_{section-id} \
  --frame={FRAME} --public-dir=public \
  scripts/poc-video/remotion/review-frames/{section-id}-frame-{FRAME}.png
```

※ Composition ID は `QuestVideo` + section_id の `-` を除いて camelCase にしたもの（例: `01-01` → `QuestVideo0101`）

キャプチャしたフレーム画像を Read して目視確認する:
- レイアウト崩れがないか
- テキストが切れていないか
- 図解が正しく表示されているか

問題がある場合は親に報告する（自動修正は行わない）。

### 9. 動画レンダリング・配置

レンダリングを実行し、セクションMDと同階層に配置する（remotion/ ディレクトリから実行）:

```bash
# sections/ ディレクトリはすでに存在するはずだが念のため確認
ls textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/

# レンダリング（出力先を直接 sections/ に絶対パスで指定）
node_modules/.bin/remotion render src/Root.tsx QuestVideo_{section-id} \
  /absolute/path/to/textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/{section-slug}.mp4 \
  --public-dir=public
```

完了後、MDとMP4がペアで存在することを確認する:
```bash
ls textbooks/{slug}/curriculums/{curriculum-id}/chapters/{chapter-id}/sections/ | grep {section-slug}
# 期待: 01-llamaindex-design.md と 01-llamaindex-design.mp4 が並ぶ
```

### 10. 完了サマリを返す（親の文脈を汚さないよう要点のみ）

- 生成した動画のパスとファイルサイズ
- 総尺（秒）
- フレームキャプチャで確認した問題点（なければ「問題なし」）
- 警告（60秒超えなど）

---

## エラー時の対応

| エラー | 対応 |
|---|---|
| VOICEVOX不応答 | 即座に親に報告して終了 |
| TypeScriptエラー | gen-root.ts の問題の可能性。親に報告 |
| レンダリングエラー | エラーログを親に報告して終了 |
| フレームキャプチャで明らかな崩れ | 親に報告（自動修正はしない） |
