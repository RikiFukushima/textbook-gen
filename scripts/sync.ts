/**
 * sync.ts — ローカル生成物 → Supabase 同期 CLI
 *
 *   pnpm sync {slug}      単一教材を同期
 *   pnpm sync --all       全教材を同期
 *   pnpm sync --dry-run   差分(orphan 削除含む)をプレビューのみ
 *
 * 階層: textbook > curriculum > chapter > section(textbook:curriculum = 1:多)
 *
 * 処理(spec 9 章):
 *   1. meta.yaml                       → textbooks upsert
 *   2. contains_local_sources: true なら公開不可を警告
 *   3. curriculums/{id}/curriculum.yaml + outline.yaml → curriculums upsert(outline は curriculums.outline)
 *   4. curriculums/{id}/chapters/{ch}/chapter.yaml     → chapters upsert
 *   5. curriculums/{id}/chapters/{ch}/sections/*.md    → sections upsert(frontmatter は jsonb)
 *   6. curriculums/{id}/quizzes/*.json → quizzes upsert
 *   7. shared_with の差分 → shared_access
 *   8. orphan delete: ローカルに無い curriculum/chapter/section/quiz を削除し DB を正本に一致
 *      (削除を伴う同期は --dry-run 提示後に明示確認)
 *
 * TODO(Phase 2): Supabase クライアント・YAML/frontmatter パーサ・upsert/delete を実装
 */

async function main() {
  throw new Error("not implemented — Phase 2 で実装");
}

main();
