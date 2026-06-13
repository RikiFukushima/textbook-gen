export type SceneKind = "cover" | "point" | "hook";

/** PointScene に渡す図解の種類 */
export type DiagramKind =
  | "comparison"   // シーン①: 「検索+LLM」 vs 「索引設計」の2ブロック比較
  | "flow"         // シーン②: 4ステップフロー（ブロックが順次出現）
  | "versus"       // シーン③: LangChain vs LlamaIndex の2カラム対比
  | "none";        // 図なし（キャプションのみ）

export type SceneData = {
  kind: SceneKind;
  caption: string;
  narration: string;
  label?: string;
  durationSec: number; // 音声の実尺
  diagram?: DiagramKind; // PointScene で表示する図解
};

export type ScriptData = {
  title: string;
  source?: string;
  scenes: SceneData[];
};
