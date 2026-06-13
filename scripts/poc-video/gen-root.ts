/**
 * gen-root.ts
 *
 * scripts/poc-video/scripts/*.json を全件スキャンして
 * remotion/src/Root.tsx を自動生成する。
 *
 * video-renderer が Root.tsx を直接編集しなくてよくなり、
 * 複数エージェントの競合・ファイル肥大化・手動追記ミスを防ぐ。
 *
 * 使い方:
 *   npx tsx scripts/poc-video/gen-root.ts
 *   (video-renderer の手順 6 の代わりに呼ぶ)
 *
 * 仕様:
 * - scripts/poc-video/scripts/{id}.json のファイル名から section_id を取得
 * - section_id は JSON の section_id フィールド > ファイル名(拡張子除く) の順で使う
 * - 音声ファイルは public/{section_id}/voice-0N.wav が存在すれば含める
 *   (存在しなければ空配列 → まだ音声未生成の台本でも Root.tsx に登録できる)
 * - Composition ID は "QuestVideo_{section_id の - を除いたもの}" (例: QuestVideo0101)
 * - QUEST_SCRIPT(元のPOCデモ)は scripts/poc-video/scripts/ に
 *   quest.json として置いておけば自動的に含まれる
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
const SCRIPTS_DIR = resolve(ROOT, "scripts/poc-video/scripts");
const PUBLIC_DIR = resolve(ROOT, "scripts/poc-video/remotion/public");
const ROOT_TSX = resolve(ROOT, "scripts/poc-video/remotion/src/Root.tsx");

interface ScriptData {
  title: string;
  section_id?: string;
  source?: string;
  scenes: { durationSec: number; narration: string; [k: string]: unknown }[];
}

function toVarName(sectionId: string): string {
  // "01-01" → "0101", "01-llamaindex-design" → "01LlamaindexDesign" などに変換
  // ConstantCase で collision しにくくするため、数字と英字をそのまま結合
  return sectionId.replace(/-+([a-z0-9])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, "");
}

function toCompositionId(sectionId: string): string {
  return `QuestVideo${toVarName(sectionId)}`;
}

function getAudioFiles(sectionId: string): string[] {
  const dir = join(PUBLIC_DIR, sectionId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith("voice-") && f.endsWith(".wav"))
    .sort()
    .map((f) => `${sectionId}/${f}`);
}

function renderSceneData(scene: unknown): string {
  return JSON.stringify(scene, null, 4)
    .split("\n")
    .map((l) => `    ${l}`)
    .join("\n");
}

// scripts/ ディレクトリの全 JSON を収集
const jsonFiles = existsSync(SCRIPTS_DIR)
  ? readdirSync(SCRIPTS_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()
  : [];

if (jsonFiles.length === 0) {
  console.warn("[gen-root] scripts/ に JSON が見つかりません。Root.tsx は更新しません。");
  process.exit(0);
}

const entries: { sectionId: string; varName: string; compositionId: string; script: ScriptData; audio: string[] }[] = [];

for (const file of jsonFiles) {
  const filePath = join(SCRIPTS_DIR, file);
  let script: ScriptData;
  try {
    script = JSON.parse(readFileSync(filePath, "utf-8")) as ScriptData;
  } catch (e) {
    console.warn(`[gen-root] ${file} のパースに失敗しました。スキップします。`, e);
    continue;
  }
  // section_id の決定: JSON フィールド > ファイル名
  const sectionId = script.section_id ?? basename(file, ".json");
  const varName = toVarName(sectionId);
  const compositionId = toCompositionId(sectionId);
  const audio = getAudioFiles(sectionId);
  entries.push({ sectionId, varName, compositionId, script, audio });
}

// Root.tsx を生成
const scriptConsts = entries
  .map(({ sectionId, varName, script }) => {
    const json = JSON.stringify(script, null, 2)
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    // eslint-disable-next-line prettier/prettier
    return `// ━━ ${sectionId}: ${script.title} ━━\n// biome-ignore lint: auto-generated\n// eslint-disable-next-line @typescript-eslint/no-explicit-any\nconst SCRIPT_${varName} = ${json} as unknown as ScriptData;\n`;
  })
  .join("\n");

const audioConsts = entries
  .map(({ varName, audio }) => {
    const items = audio.map((a) => `  "${a}"`).join(",\n");
    return `const AUDIO_${varName}: string[] = [\n${items}\n];\n`;
  })
  .join("\n");

const compositions = entries
  .map(({ varName, compositionId }) => {
    return `    <Composition
      id="${compositionId}"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_${varName})}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_${varName},
        audioFiles: AUDIO_${varName},
      }}
    />`;
  })
  .join("\n");

const output = `// ⚠️  このファイルは gen-root.ts が自動生成します。直接編集しないこと。
// 再生成: npx tsx scripts/poc-video/gen-root.ts
import React from "react";
import { Composition, registerRoot } from "remotion";
import { QuestVideoComposition } from "./QuestComposition";
import { ScriptData } from "./types";

const FPS = 30;

function totalFrames(script: ScriptData): number {
  return script.scenes.reduce((s, sc) => s + Math.ceil(sc.durationSec * FPS), 0);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 台本データ (auto-generated from scripts/*.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${scriptConsts}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 音声パス (auto-generated)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${audioConsts}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composition 登録
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RemotionRoot: React.FC = () => (
  <>
${compositions}
  </>
);

registerRoot(RemotionRoot);
`;

writeFileSync(ROOT_TSX, output, "utf-8");
console.log(`[gen-root] Root.tsx を再生成しました。${entries.length} Composition(s).`);
entries.forEach(({ compositionId, sectionId, audio }) => {
  const audioStatus = audio.length > 0 ? `音声${audio.length}本` : "音声未生成";
  console.log(`  - ${compositionId} (${sectionId}) [${audioStatus}]`);
});
