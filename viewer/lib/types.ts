export type Visibility = "private" | "shared" | "unlisted" | "public";

export interface Meta {
  slug: string;
  title: string;
  description?: string;
  version?: string;
  authors?: string[];
  visibility?: Visibility;
  tags?: string[];
  curriculum_order?: string[];
}

export interface CurriculumMeta {
  id: string;
  title: string;
  description?: string;
  order?: number;
  estimated_hours?: number;
  target_audience?: {
    level?: string;
    prerequisites?: string[];
  };
  chapter_order: string[];
}

export interface OutlineSection {
  id: string;
  title: string;
  estimated_minutes?: number;
}

export interface OutlineChapter {
  id: string;
  title: string;
  estimated_minutes?: number;
  learning_objectives?: string[];
  sections?: OutlineSection[];
  quiz?: { count?: number; difficulty?: string };
}

export interface Outline {
  title: string;
  target_audience?: {
    level?: string;
    prerequisites?: string[];
    estimated_hours?: number;
  };
  chapters: OutlineChapter[];
}

export interface ChapterMeta {
  id: string;
  title: string;
  estimated_minutes?: number;
  learning_objectives?: string[];
  section_order: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface SectionFrontmatter {
  section_id: string;
  chapter_id: string;
  title: string;
  order: number;
  estimated_minutes?: number;
  estimated_chars?: number;
  learning_points?: string[];
  tags?: string[];
  related_sections?: string[];
  key_terms?: KeyTerm[];
}

export interface Section {
  frontmatter: SectionFrontmatter;
  content: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
  source_refs?: { section_id: string; anchor?: string }[];
  difficulty?: string;
  tags?: string[];
}

export interface Quiz {
  chapter_id: string;
  questions: QuizQuestion[];
}

export interface Chapter {
  meta: ChapterMeta;
  sections: Section[];
  quiz: Quiz | null;
}

export interface Curriculum {
  meta: CurriculumMeta;
  chapters: Chapter[];
}

export interface Textbook {
  meta: Meta;
  curriculums: Curriculum[];
}

export interface TextbookSummary {
  meta: Meta;
  curriculumCount: number;
  chapterCount: number;
  sectionCount: number;
  estimatedHours?: number;
}
