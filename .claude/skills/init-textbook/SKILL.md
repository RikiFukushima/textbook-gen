---
name: init-textbook
description: 新しい教材(textbook)や、既存教材への新しいカリキュラム(curriculum)の雛形(meta.yaml / curriculum.yaml / outline.yaml + ディレクトリ)を生成する。ユーザーが「教材を新規作成して」「カリキュラムを追加して」「教材の雛形を作って」と言ったときに使う。ディレクトリと空テンプレートの作成までが役割で、骨子(章・節)の中身を考えて埋めるのは outline スキルの役割。
argument-hint: "<slug> [curriculum-id]"
allowed-tools:
  - Bash
  - Read
---

# init-textbook — 教材・カリキュラムの雛形生成

決定論的な雛形生成は `scripts/init-textbook.ts` が担います。この skill はその呼び出しと、生成後の案内を行う薄いラッパーです。**雛形(空テンプレート + ディレクトリ)の作成までが役割**で、骨子の中身を考えて書くのは `outline` skill に渡します。

## 手順

1. 引数から `slug`(教材スラッグ、必須)と `curriculum-id`(任意、既定 `main`)を決める。命名は英小文字・数字・ハイフン。`$ARGUMENTS` をそのまま渡してよい。
2. リポジトリルート(`textbook-gen/`)で次を実行する:

   ```bash
   npm run init-textbook -- $ARGUMENTS
   ```

   - 新規教材なら `meta.yaml`(visibility は private 固定)を作成。
   - 既存教材なら `meta.yaml` は変更せず `curriculum_order` に追記。
   - `curriculums/{id}/` に `curriculum.yaml`・空の `outline.yaml`・`chapters/`・`quizzes/` を生成。
   - 既存カリキュラムがある場合はエラー。上書きが必要なときだけ `--force`。
3. 出力された生成パスをユーザーに伝える。
4. 続けて骨子を作る場合は **`outline` skill** に進む(この skill は中身を書かない)。

## 使い分け(重要)

- 「ディレクトリ・空ファイルを作りたい」→ この skill。
- 「学習内容を分解して章・節の骨子を作りたい」→ `outline` skill。
- 迷ったら、まずこの skill で器を作り、その後 `outline` で中身を埋める。
