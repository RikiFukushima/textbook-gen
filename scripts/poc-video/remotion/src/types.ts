export type SceneKind = "cover" | "point" | "hook";

// ポイントシーンのスライド内容の種類
export type SlideKind =
  | "bullets"   // 箇条書きリスト
  | "compare"   // 2項比較カード（左右）
  | "steps"     // ステップフロー（上から下）
  | "keyword";  // キーワード強調（大きなキーワード + 短い説明）

// bullets用データ
export type BulletsData = {
  kind: "bullets";
  items: string[]; // 3〜4個の箇条書き
};

// compare用データ
export type CompareData = {
  kind: "compare";
  left: { label: string; points: string[] };  // ❌ 誤解 / 旧手法
  right: { label: string; points: string[] }; // ✅ 実際 / 新手法
};

// steps用データ
export type StepsData = {
  kind: "steps";
  items: { label: string; desc: string }[]; // 3〜4ステップ
};

// keyword用データ
export type KeywordData = {
  kind: "keyword";
  word: string;      // 大きく表示するキーワード（例: "索引設計"）
  tagline: string;   // 短い説明（例: "RAGの精度を決める核心"）
  points: string[];  // 2〜3個のポイント
};

export type SlideData = BulletsData | CompareData | StepsData | KeywordData;

export type SceneData = {
  kind: SceneKind;
  caption: string;
  narration: string;
  label?: string;
  durationSec: number;
  slide?: SlideData; // ポイントシーンの内容（hookとcoverは不要）
};

export type ScriptData = {
  title: string;
  source?: string;
  section_id?: string;
  scenes: SceneData[];
};
