/**
 * init-textbook.ts — 新規教材ディレクトリの初期化
 *
 *   pnpm init-textbook {slug}
 *
 * 生成:
 *   textbooks/{slug}/
 *     ├─ meta.yaml      (テンプレートを書き出し。visibility は private 固定)
 *     ├─ outline.yaml   (空の骨子テンプレート)
 *     ├─ chapters/      (空)
 *     └─ quizzes/       (空)
 *
 * TODO(Phase 1 後半): slug バリデーション・既存チェック・テンプレート書き出しを実装
 */

async function main() {
  throw new Error("not implemented");
}

main();
