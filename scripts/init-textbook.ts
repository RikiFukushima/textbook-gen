/**
 * init-textbook.ts — 教材・カリキュラムの雛形を生成する CLI
 *
 *   npm run init-textbook -- <slug> [curriculum-id] [--force] [--title "..."] [--curriculum-title "..."]
 *   npx tsx scripts/init-textbook.ts <slug> [curriculum-id]
 *
 * 階層: 教材(textbook) > カリキュラム(curriculum) > 章 > 節
 * 生成:
 *   textbooks/{slug}/
 *     ├─ meta.yaml                         (新規教材のときのみ作成。private 固定)
 *     └─ curriculums/{curriculum-id}/
 *         ├─ curriculum.yaml
 *         ├─ outline.yaml                  (空の骨子テンプレート)
 *         ├─ chapters/.gitkeep
 *         └─ quizzes/.gitkeep
 *
 * - 既存教材なら meta.yaml は変更せず、curriculum_order に id を追記するのみ。
 * - 確定的な雛形生成・バリデーションを担う(本文・骨子の中身は outline/chapter スキルの役割)。
 */

import fs from "node:fs";
import path from "node:path";

const TEXTBOOKS_ROOT = path.resolve(import.meta.dirname, "..", "textbooks");
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

interface Args {
  slug: string;
  curriculumId: string;
  force: boolean;
  title?: string;
  curriculumTitle?: string;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let force = false;
  let title: string | undefined;
  let curriculumTitle: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") {
      force = true;
    } else if (a === "--title" || a.startsWith("--title=")) {
      title = a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i];
    } else if (a === "--curriculum-title" || a.startsWith("--curriculum-title=")) {
      curriculumTitle = a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i];
    } else if (a.startsWith("--")) {
      fail(`不明なオプション: ${a}`);
    } else {
      positional.push(a);
    }
  }

  const slug = positional[0];
  const curriculumId = positional[1] ?? "main";
  if (!slug) {
    fail(
      "使い方: npm run init-textbook -- <slug> [curriculum-id] [--force] [--title \"...\"] [--curriculum-title \"...\"]"
    );
  }
  if (!SLUG_RE.test(slug)) {
    fail(`slug が不正です: "${slug}"(英小文字・数字・ハイフンのみ、先頭は英数字)`);
  }
  if (!SLUG_RE.test(curriculumId)) {
    fail(`curriculum-id が不正です: "${curriculumId}"(英小文字・数字・ハイフンのみ、先頭は英数字)`);
  }
  return { slug, curriculumId, force, title, curriculumTitle };
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function metaTemplate(slug: string, title: string, curriculumId: string): string {
  const d = today();
  return `slug: ${slug}
title: ${title}
description: ""
version: 0.1.0
created_at: ${d}
updated_at: ${d}
authors: []
visibility: private # private | shared | unlisted | public
shared_with: []
unlisted_token: null
search_indexable: false
allow_fork: false
tags: []
contains_local_sources: false
curriculum_order:
  - ${curriculumId}
`;
}

function curriculumTemplate(id: string, title: string, order: number): string {
  return `id: ${id}
title: ${title}
description: ""
order: ${order}
estimated_hours: 0
target_audience:
  level: 初級 # 初級 | 中級 | 上級
  prerequisites: []
chapter_order: []
`;
}

function outlineTemplate(title: string): string {
  return `title: ${title}
target_audience:
  level: 初級 # 初級 | 中級 | 上級
  prerequisites: []
  estimated_hours: 0
style:
  tone: ですます調・実務寄り
  code_examples: true
  diagram_default: mermaid
chapters: []
`;
}

/** 既存 curriculum.yaml を持つカリキュラム数を数える(order 決定用) */
function countCurriculums(textbookDir: string): number {
  const root = path.join(textbookDir, "curriculums");
  if (!fs.existsSync(root)) return 0;
  return fs
    .readdirSync(root)
    .filter((name) => fs.existsSync(path.join(root, name, "curriculum.yaml"))).length;
}

/** 既存 meta.yaml の curriculum_order に id を(コメントを保ったまま)追記する */
function ensureCurriculumOrder(metaPath: string, id: string): "added" | "exists" | "appended-key" {
  const text = fs.readFileSync(metaPath, "utf-8");
  const lines = text.split("\n");
  const keyIdx = lines.findIndex((l) => /^curriculum_order:\s*$/.test(l));

  if (keyIdx === -1) {
    // キーごと末尾に追記
    const sep = text.endsWith("\n") ? "" : "\n";
    fs.writeFileSync(metaPath, `${text}${sep}curriculum_order:\n  - ${id}\n`);
    return "appended-key";
  }

  // curriculum_order: 直下のリスト項目を収集
  let lastItemIdx = keyIdx;
  const itemRe = /^\s*-\s*(.+?)\s*$/;
  for (let i = keyIdx + 1; i < lines.length; i++) {
    const m = lines[i].match(itemRe);
    if (m) {
      const val = m[1].replace(/^["']|["']$/g, "");
      if (val === id) return "exists";
      lastItemIdx = i;
    } else if (lines[i].trim() === "") {
      continue;
    } else {
      break; // 別キーに到達
    }
  }
  lines.splice(lastItemIdx + 1, 0, `  - ${id}`);
  fs.writeFileSync(metaPath, lines.join("\n"));
  return "added";
}

function writeIfAbsent(file: string, content: string, created: string[], skipped: string[]) {
  if (fs.existsSync(file)) {
    skipped.push(file);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  created.push(file);
}

function rel(p: string): string {
  return path.relative(process.cwd(), p);
}

function main() {
  const { slug, curriculumId, force, title, curriculumTitle } = parseArgs(
    process.argv.slice(2)
  );

  const textbookDir = path.join(TEXTBOOKS_ROOT, slug);
  const metaPath = path.join(textbookDir, "meta.yaml");
  const curriculumDir = path.join(textbookDir, "curriculums", curriculumId);

  const created: string[] = [];
  const skipped: string[] = [];
  const notes: string[] = [];

  const isNewTextbook = !fs.existsSync(metaPath);

  // カリキュラムディレクトリの既存チェック
  if (fs.existsSync(curriculumDir) && !force) {
    fail(
      `カリキュラムが既に存在します: ${rel(curriculumDir)}(上書きするには --force)`
    );
  }

  // 1) 教材メタ
  const order = countCurriculums(textbookDir) + 1;
  if (isNewTextbook) {
    writeIfAbsent(metaPath, metaTemplate(slug, title ?? slug, curriculumId), created, skipped);
  } else {
    const r = ensureCurriculumOrder(metaPath, curriculumId);
    if (r === "exists") notes.push(`meta.yaml: curriculum_order に ${curriculumId} は既出(変更なし)`);
    else notes.push(`meta.yaml: curriculum_order に ${curriculumId} を追記`);
  }

  // 2) カリキュラム雛形
  writeIfAbsent(
    path.join(curriculumDir, "curriculum.yaml"),
    curriculumTemplate(curriculumId, curriculumTitle ?? curriculumId, order),
    created,
    skipped
  );
  writeIfAbsent(
    path.join(curriculumDir, "outline.yaml"),
    outlineTemplate(curriculumTitle ?? curriculumId),
    created,
    skipped
  );
  writeIfAbsent(path.join(curriculumDir, "chapters", ".gitkeep"), "", created, skipped);
  writeIfAbsent(path.join(curriculumDir, "quizzes", ".gitkeep"), "", created, skipped);

  // 出力
  console.log(
    `\n${isNewTextbook ? "✓ 新規教材" : "✓ 既存教材にカリキュラム追加"}: ${slug} / ${curriculumId}\n`
  );
  if (created.length) {
    console.log("作成:");
    for (const f of created) console.log(`  + ${rel(f)}`);
  }
  if (skipped.length) {
    console.log("既存のためスキップ:");
    for (const f of skipped) console.log(`  · ${rel(f)}`);
  }
  for (const n of notes) console.log(`  ${n}`);

  console.log(
    `\n次の一手:\n  1. outline スキルで ${rel(path.join(curriculumDir, "outline.yaml"))} の骨子(chapters/sections)を埋める\n  2. chapter スキルで章本文、quiz スキルでクイズを生成\n`
  );
}

main();
