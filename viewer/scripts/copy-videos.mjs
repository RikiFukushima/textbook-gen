/**
 * copy-videos.mjs
 * 静的エクスポート(next build)後に textbooks/ 配下の MP4 を out/textbooks/ へコピーする。
 * Next.js の output:"export" は public/ のみ自動コピーするため、
 * MP4 はこのスクリプトで手動コピーする。
 *
 * 使い方: node scripts/copy-videos.mjs
 * package.json の build スクリプトから自動的に呼ばれる。
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIEWER_ROOT = resolve(__dirname, "..");
const TEXTBOOKS_SRC = resolve(VIEWER_ROOT, "..", "textbooks");
const TEXTBOOKS_DEST = resolve(VIEWER_ROOT, "out", "textbooks");

let copied = 0;

function copyMp4s(srcDir, destDir) {
  if (!existsSync(srcDir)) return;
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    const dest = join(destDir, name);
    if (statSync(src).isDirectory()) {
      copyMp4s(src, dest);
    } else if (name.endsWith(".mp4")) {
      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, dest);
      console.log(`  copied: ${src.replace(TEXTBOOKS_SRC, "textbooks")} → out/`);
      copied++;
    }
  }
}

console.log("[copy-videos] Copying MP4 files to out/textbooks/ ...");
copyMp4s(TEXTBOOKS_SRC, TEXTBOOKS_DEST);
console.log(`[copy-videos] Done. ${copied} file(s) copied.`);
