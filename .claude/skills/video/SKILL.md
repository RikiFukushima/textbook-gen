---
name: video
description: セクションMDを指定するだけでショート動画(MP4)を生成するオーケストレータ。「このセクションの動画を作って」「この章の全セクションを動画化して」などのときに使う。台本生成はvideo-script-writerエージェントに、音声生成・レンダリングはvideo-rendererエージェントに委譲する。
---

# video — ショート動画生成のオーケストレータ

このスキルは **薄いラッパー** です。実際の台本生成・音声生成・レンダリングは専用エージェントが行います。**どのエージェントに何を渡すか** だけを定義します。

## 役割の境界

| 担当 | 役割 |
|---|---|
| **このスキル** | 入力解釈 / セクションリスト組み立て / エージェント起動 / サマリ集約 |
| **video-script-writer** | セクションMD → 台本JSON生成（1セクション = 1エージェント） |
| **video-renderer** | 台本JSON + 音声生成 + Remotionレンダリング（1セクション = 1エージェント） |
| **video-style** | 全工程で守るルールの正本（各エージェントがプリロード） |

---

## 入力の確認（対話）

以下を確認してから実行する。不明な場合は AskUserQuestion で聞く。

1. **対象セクションの特定**
   - `slug`（教材）・`curriculum-id`・`chapter-id`・`section-id` を確認
   - 章単位の場合は該当章配下の全セクションを列挙
   - 教材単位の場合は全セクションを列挙（38本など大量になる場合は確認する）

2. **既存ファイルの確認**
   - 台本JSON（`scripts/poc-video/scripts/{section-id}.json`）がすでに存在する場合は再生成するか確認
   - 音声ファイル（`remotion/public/{section-id}/`）が存在する場合も同様

3. **VOICEVOXの起動確認**
   ```bash
   curl -s http://localhost:50021/version
   ```
   応答がない場合はユーザーに起動を促してから続行する。

---

## 実行フロー

### Phase 1: 台本生成（video-script-writer を並列起動）

セクションごとに **1エージェント** を起動する。

```
[Agent #1] video-script-writer  section-md=textbooks/.../sections/01-xxx.md
[Agent #2] video-script-writer  section-md=textbooks/.../sections/02-xxx.md
...
```

- 並列数の上限: **3セクション同時**（LLMコスト・品質管理のため）
- 各エージェントが返す台本JSONを受け取り、品質チェック（video-style §8）を行う
- 問題があるシーンは video-script-writer を再起動して修正する

### Phase 2: 音声生成・レンダリング（video-renderer を起動）

台本JSONが確定したセクションから順次 video-renderer を起動する。

```
[Agent] video-renderer  script-json=scripts/poc-video/scripts/{section-id}.json
```

- Phase 1 と Phase 2 は **完全にシリアル**（音声生成にVOICEVOXを使うため、並列は不安定）
- レンダリング完了後にフレームキャプチャ画像（5枚）を確認する

---

## 完了後のサマリ

以下の表をユーザーに提示する:

| section-id | 台本 | 音声 | 動画 | 尺 | 備考 |
|---|---|---|---|---|---|
| 01-01 | ✅ | ✅ | ✅ | 42s | |
| 01-02 | ✅ | ✅ | ❌ | - | レンダリングエラー |

---

## 単発実行（1セクション）

ユーザーが「このセクションの動画を1本作って」と言った場合の最短フロー:

1. セクションMDのパスを確認
2. video-script-writer で台本生成
3. 台本を目視確認（ユーザーに見せてOKをもらう）
4. video-renderer で音声生成 + レンダリング
5. 動画パスとフレームキャプチャをユーザーに提示
