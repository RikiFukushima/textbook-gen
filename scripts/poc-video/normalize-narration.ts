/**
 * normalize-narration.ts
 *
 * ナレーション文字列中のアルファベット語彙をカタカナに変換する。
 * VOICEVOX(ずんだもん)がアルファベットをそのまま読もうとすると
 * 「アールエージージー」「エルエルエム」のように誤読するケースを防ぐ。
 *
 * 変換辞書: scripts/poc-video/tts-dict.json (SSoT)
 * 適用対象: narration フィールドのみ。caption は表示用なので変換しない。
 *
 * 単体実行:
 *   tsx scripts/poc-video/normalize-narration.ts "RAGはLLMに聞く仕組みなのだ。"
 *
 * モジュールとして:
 *   import { normalizeNarration } from "./normalize-narration.js";
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DICT_PATH = join(__dirname, "tts-dict.json");

type TtsDict = {
  terms: Record<string, string>;
};

let _dict: Record<string, string> | null = null;

function loadDict(): Record<string, string> {
  if (_dict) return _dict;
  const raw: TtsDict = JSON.parse(readFileSync(DICT_PATH, "utf8"));
  // 長い語を先に照合するため、キー長の降順でソート
  _dict = Object.fromEntries(
    Object.entries(raw.terms).sort(([a], [b]) => b.length - a.length),
  );
  return _dict;
}

/**
 * テキスト内のアルファベット語彙(辞書に登録された語)をカタカナに変換する。
 *
 * マッチルール:
 * - 大文字・小文字を区別しない(RAG / rag / Rag はどれも「ラグ」に変換)
 * - 単語境界(前後が英数字・ハイフン以外、または文字列の端)でのみマッチ
 * - 辞書の最長マッチを優先(RAG の前に RAGUIDE のような語があれば RAGUIDE を優先)
 */
export function normalizeNarration(text: string): string {
  const dict = loadDict();
  let result = text;

  for (const [key, reading] of Object.entries(dict)) {
    // 単語境界パターン: 英字・数字・ハイフン以外が前後にある、または文字列端
    const pattern = new RegExp(
      `(?<![A-Za-z0-9-])${escapeRegex(key)}(?![A-Za-z0-9-])`,
      "gi",
    );
    result = result.replace(pattern, reading);
  }

  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ──────────────────────────────────────────────
// 単体実行モード
// ──────────────────────────────────────────────
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv[2];
  if (!input) {
    console.error("usage: tsx normalize-narration.ts <narration text>");
    process.exit(1);
  }
  const output = normalizeNarration(input);
  console.log("Input :", input);
  console.log("Output:", output);
}
