/**
 * init-textbook.ts — 新規教材ディレクトリの初期化
 *
 *   pnpm init-textbook {slug} [curriculum-id]
 *
 * 生成(階層: 教材 > カリキュラム > 章 > 節):
 *   textbooks/{slug}/
 *     ├─ meta.yaml                       (テンプレート。visibility は private 固定、curriculum_order)
 *     └─ curriculums/{curriculum-id}/
 *         ├─ curriculum.yaml             (カリキュラムメタのテンプレート)
 *         ├─ outline.yaml                (空の骨子テンプレート)
 *         ├─ chapters/                   (空)
 *         └─ quizzes/                    (空)
 *
 * TODO(Phase 1 後半): slug/curriculum-id バリデーション・既存チェック・テンプレート書き出しを実装
 */

async function main() {
  throw new Error("not implemented");
}

main();
