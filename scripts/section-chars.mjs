#!/usr/bin/env node
// section-chars.mjs — セクション本文の「地の文+見出し」字数を決定論的に数える。
//
// textbook-gen の字数カウント基準(textbook-style §4.3)の唯一の実装:
//   - frontmatter(先頭の --- ... --- ブロック)を除外
//   - fenced コードブロック / Mermaid 図(``` ... ```)を除外
//   - 残った地の文+見出しから空白(改行・スペース等)をすべて除いた文字数を数える
//
// chapter-writer はこのスクリプトの出力を estimated_chars に記入する(目分量・wc -m 全文は禁止)。
//
// 使い方:
//   node scripts/section-chars.mjs <file.md> [<file2.md> ...]
//   npm run count-chars -- path/to/section.md
//
// 出力: 各ファイルにつき「<実測字数>\t<パス>」。複数指定時は最後に合計を表示。

import fs from "node:fs";

function bodyChars(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  // 先頭の frontmatter ブロックのみ除外(本文中の --- 区切り線は壊さない)
  text = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  // fenced コードブロック / Mermaid 図を除外(```lang ... ```)
  text = text.replace(/```[\s\S]*?```/g, "");
  // 空白をすべて除いた可視文字数
  return text.replace(/\s/g, "").length;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/section-chars.mjs <file.md> [<file2.md> ...]");
  process.exit(1);
}

let total = 0;
for (const f of files) {
  const n = bodyChars(f);
  total += n;
  console.log(`${n}\t${f}`);
}
if (files.length > 1) {
  console.log(`${total}\tTOTAL`);
}
