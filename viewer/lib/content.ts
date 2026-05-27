import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  Chapter,
  ChapterMeta,
  Meta,
  Outline,
  Quiz,
  Section,
  SectionFrontmatter,
  Textbook,
  TextbookSummary,
} from "./types";

const TEXTBOOKS_ROOT = path.resolve(process.cwd(), "..", "textbooks");

// 公開ビルドの安全策: 既定では public / unlisted のみを含める。
// ローカルでは BUILD_VISIBILITY=all で全件プレビュー可能。
function allowedVisibilities(): Set<string> {
  const env = (process.env.BUILD_VISIBILITY || "public,unlisted").toLowerCase();
  if (env === "all") return new Set(["private", "shared", "unlisted", "public"]);
  return new Set(env.split(",").map((s) => s.trim()));
}

function readYaml<T>(file: string): T {
  return yaml.load(fs.readFileSync(file, "utf-8")) as T;
}

function isTextbookDir(slug: string): boolean {
  const dir = path.join(TEXTBOOKS_ROOT, slug);
  return (
    fs.existsSync(dir) &&
    fs.statSync(dir).isDirectory() &&
    fs.existsSync(path.join(dir, "meta.yaml"))
  );
}

function listAllSlugs(): string[] {
  if (!fs.existsSync(TEXTBOOKS_ROOT)) return [];
  return fs
    .readdirSync(TEXTBOOKS_ROOT)
    .filter((name) => !name.startsWith(".") && isTextbookDir(name));
}

function loadMeta(slug: string): Meta {
  return readYaml<Meta>(path.join(TEXTBOOKS_ROOT, slug, "meta.yaml"));
}

function isVisible(meta: Meta): boolean {
  return allowedVisibilities().has((meta.visibility || "private").toLowerCase());
}

/** ビルド対象の slug 一覧(直リンクで到達可能。generateStaticParams 用) */
export function getVisibleSlugs(): string[] {
  return listAllSlugs().filter((slug) => isVisible(loadMeta(slug)));
}

/** 一覧(トップページ)に出す slug。unlisted は直リンク専用なので除外する */
export function getListableSlugs(): string[] {
  return getVisibleSlugs().filter(
    (slug) => (loadMeta(slug).visibility || "private").toLowerCase() !== "unlisted"
  );
}

function loadOutline(slug: string): Outline {
  return readYaml<Outline>(path.join(TEXTBOOKS_ROOT, slug, "outline.yaml"));
}

function loadChapter(slug: string, chapterId: string): Chapter {
  const chapterDir = path.join(TEXTBOOKS_ROOT, slug, "chapters", chapterId);
  const meta = readYaml<ChapterMeta>(path.join(chapterDir, "chapter.yaml"));

  const sectionsDir = path.join(chapterDir, "sections");
  const files = fs.existsSync(sectionsDir)
    ? fs.readdirSync(sectionsDir).filter((f) => f.endsWith(".md"))
    : [];

  const sections: Section[] = files
    .map((file) => {
      const parsed = matter(fs.readFileSync(path.join(sectionsDir, file), "utf-8"));
      return {
        frontmatter: parsed.data as SectionFrontmatter,
        content: parsed.content.trim(),
      };
    })
    .sort((a, b) => (a.frontmatter.order ?? 0) - (b.frontmatter.order ?? 0));

  // section_order があればそれに従って並べ替え
  if (meta.section_order?.length) {
    sections.sort(
      (a, b) =>
        meta.section_order.indexOf(a.frontmatter.section_id) -
        meta.section_order.indexOf(b.frontmatter.section_id)
    );
  }

  const quizFile = path.join(TEXTBOOKS_ROOT, slug, "quizzes", `${chapterId}.json`);
  const quiz: Quiz | null = fs.existsSync(quizFile)
    ? (JSON.parse(fs.readFileSync(quizFile, "utf-8")) as Quiz)
    : null;

  return { meta, sections, quiz };
}

/** 教材を完全な形で取得(非表示なら null) */
export function getTextbook(slug: string): Textbook | null {
  if (!isTextbookDir(slug)) return null;
  const meta = loadMeta(slug);
  if (!isVisible(meta)) return null;

  const outline = loadOutline(slug);
  const chapters = outline.chapters
    .map((ch) => {
      try {
        return loadChapter(slug, ch.id);
      } catch {
        return null; // 未生成の章はスキップ
      }
    })
    .filter((c): c is Chapter => c !== null);

  return { meta, outline, chapters };
}

/** 一覧用サマリ */
export function getTextbookSummaries(): TextbookSummary[] {
  return getListableSlugs().flatMap((slug) => {
    const tb = getTextbook(slug);
    if (!tb) return [];
    const sectionCount = tb.chapters.reduce((n, c) => n + c.sections.length, 0);
    const summary: TextbookSummary = {
      meta: tb.meta,
      chapterCount: tb.chapters.length,
      sectionCount,
      estimatedHours: tb.outline.target_audience?.estimated_hours,
    };
    return [summary];
  });
}
