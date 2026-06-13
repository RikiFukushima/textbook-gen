import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  Chapter,
  ChapterMeta,
  Curriculum,
  CurriculumMeta,
  Meta,
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

function loadChapter(
  chaptersDir: string,
  quizzesDir: string,
  chapterId: string,
  slug: string,
  curriculumId: string,
): Chapter {
  const chapterDir = path.join(chaptersDir, chapterId);
  const meta = readYaml<ChapterMeta>(path.join(chapterDir, "chapter.yaml"));

  const sectionsDir = path.join(chapterDir, "sections");
  const files = fs.existsSync(sectionsDir)
    ? fs.readdirSync(sectionsDir).filter((f) => f.endsWith(".md"))
    : [];

  const sections: Section[] = files
    .map((file) => {
      const parsed = matter(fs.readFileSync(path.join(sectionsDir, file), "utf-8"));
      // MDと同名のMP4が隣に存在すれば videoPath を設定する。
      // ビューワーは textbooks/ を public/ に静的コピーして配信するため、
      // パスは /textbooks/... 形式（basePath は Next.js が自動付与）。
      const stem = file.replace(/\.md$/, "");
      const mp4Abs = path.join(sectionsDir, `${stem}.mp4`);
      const videoPath = fs.existsSync(mp4Abs)
        ? `/textbooks/${slug}/curriculums/${curriculumId}/chapters/${chapterId}/sections/${stem}.mp4`
        : undefined;
      return {
        frontmatter: parsed.data as SectionFrontmatter,
        content: parsed.content.trim(),
        videoPath,
      };
    })
    .sort((a, b) => (a.frontmatter.order ?? 0) - (b.frontmatter.order ?? 0));

  if (meta.section_order?.length) {
    sections.sort(
      (a, b) =>
        meta.section_order.indexOf(a.frontmatter.section_id) -
        meta.section_order.indexOf(b.frontmatter.section_id)
    );
  }

  const quizFile = path.join(quizzesDir, `${chapterId}.json`);
  const quiz: Quiz | null = fs.existsSync(quizFile)
    ? (JSON.parse(fs.readFileSync(quizFile, "utf-8")) as Quiz)
    : null;

  return { meta, sections, quiz };
}

function loadCurriculum(slug: string, curriculumId: string): Curriculum | null {
  const curDir = path.join(TEXTBOOKS_ROOT, slug, "curriculums", curriculumId);
  const metaFile = path.join(curDir, "curriculum.yaml");
  if (!fs.existsSync(metaFile)) return null;

  const meta = readYaml<CurriculumMeta>(metaFile);
  const chaptersDir = path.join(curDir, "chapters");
  const quizzesDir = path.join(curDir, "quizzes");

  const ids =
    meta.chapter_order?.length > 0
      ? meta.chapter_order
      : fs.existsSync(chaptersDir)
        ? fs.readdirSync(chaptersDir).sort()
        : [];

  const chapters = ids
    .map((id) => {
      try {
        return loadChapter(chaptersDir, quizzesDir, id, slug, curriculumId);
      } catch {
        return null;
      }
    })
    .filter((c): c is Chapter => c !== null);

  return { meta, chapters };
}

function listCurriculumIds(slug: string, meta: Meta): string[] {
  const curRoot = path.join(TEXTBOOKS_ROOT, slug, "curriculums");
  if (meta.curriculum_order?.length) return meta.curriculum_order;
  if (!fs.existsSync(curRoot)) return [];
  return fs
    .readdirSync(curRoot)
    .filter((name) => fs.existsSync(path.join(curRoot, name, "curriculum.yaml")))
    .sort();
}

/** 教材を完全な形で取得(非表示なら null) */
export function getTextbook(slug: string): Textbook | null {
  if (!isTextbookDir(slug)) return null;
  const meta = loadMeta(slug);
  if (!isVisible(meta)) return null;

  const curriculums = listCurriculumIds(slug, meta)
    .map((id) => loadCurriculum(slug, id))
    .filter((c): c is Curriculum => c !== null)
    .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));

  return { meta, curriculums };
}

/** 一覧用サマリ */
export function getTextbookSummaries(): TextbookSummary[] {
  return getListableSlugs().flatMap((slug) => {
    const tb = getTextbook(slug);
    if (!tb) return [];
    const chapterCount = tb.curriculums.reduce((n, c) => n + c.chapters.length, 0);
    const sectionCount = tb.curriculums.reduce(
      (n, c) => n + c.chapters.reduce((m, ch) => m + ch.sections.length, 0),
      0
    );
    const estimatedHours = tb.curriculums.reduce(
      (n, c) => n + (c.meta.estimated_hours ?? 0),
      0
    );
    const summary: TextbookSummary = {
      meta: tb.meta,
      curriculumCount: tb.curriculums.length,
      chapterCount,
      sectionCount,
      estimatedHours: estimatedHours || undefined,
    };
    return [summary];
  });
}
