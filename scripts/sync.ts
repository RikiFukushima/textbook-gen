/**
 * sync.ts — ローカル生成物 → Supabase 同期 CLI
 *
 *   pnpm sync {slug}      単一教材を同期
 *   pnpm sync --all       全教材を同期
 *   pnpm sync --dry-run   差分(orphan 削除含む)をプレビューのみ
 *
 * 処理(spec 9 章):
 *   1. meta.yaml      → textbooks upsert
 *   2. contains_local_sources: true なら公開不可を警告
 *   3. outline.yaml   → textbooks.outline 更新(構想の記録。節メタは DB に書かない)
 *   4. chapter.yaml   → chapters upsert
 *   5. sections/*.md  → sections upsert(frontmatter は jsonb)
 *   6. quizzes/*.json → quizzes upsert
 *   7. shared_with の差分 → shared_access
 *   8. orphan delete: ローカルに無い chapter/section/quiz を削除し DB を正本に一致
 *      (削除を伴う同期は --dry-run 提示後に明示確認)
 *
 * TODO(Phase 2): Supabase クライアント・YAML/frontmatter パーサ・upsert/delete を実装
 */

async function main() {
  throw new Error("not implemented — Phase 2 で実装");
}

main();
