/**
 * gen-voice.ts
 *
 * 台本 JSON の narration フィールドをもとに VOICEVOX(ずんだもん)で wav を生成する。
 * Remotion 用の public/ ディレクトリに voice-00.wav ~ voice-N.wav として出力。
 *
 * normalize-narration でアルファベット→カタカナ変換を適用済みの音声を生成するため、
 * 「RAG」が「ラグ」と読まれるなど VOICEVOX の読み誤りを防ぐ。
 *
 * usage: tsx scripts/poc-video/gen-voice.ts <script.json> [publicDir]
 *
 * デフォルト出力先: scripts/poc-video/remotion/public/
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { normalizeNarration } from "./normalize-narration.js";

const VOICEVOX_URL = "http://localhost:50021";
const ZUNDAMON_SPEAKER = 3; // ずんだもん(ノーマル)
const DEFAULT_OUT_DIR = resolve("scripts/poc-video/remotion/public");

type Scene = {
  narration: string;
  [key: string]: unknown;
};
type Script = { title: string; scenes: Scene[] };

async function voicevoxAlive(): Promise<boolean> {
  try {
    const r = await fetch(`${VOICEVOX_URL}/version`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function zundamonToWav(text: string, wav: string): Promise<void> {
  const safe = text.trim() || "。";
  const q = await fetch(
    `${VOICEVOX_URL}/audio_query?speaker=${ZUNDAMON_SPEAKER}&text=${encodeURIComponent(safe)}`,
    { method: "POST" },
  );
  if (!q.ok) throw new Error(`audio_query failed: ${q.status}`);
  const query = await q.json();
  query.speedScale = 1.15;
  query.intonationScale = 1.1;
  const s = await fetch(`${VOICEVOX_URL}/synthesis?speaker=${ZUNDAMON_SPEAKER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!s.ok) throw new Error(`synthesis failed: ${s.status}`);
  const buf = Buffer.from(await s.arrayBuffer());
  writeFileSync(wav, buf);
}

async function main() {
  const scriptPath = process.argv[2];
  const outDir = resolve(process.argv[3] || DEFAULT_OUT_DIR);

  if (!scriptPath) {
    console.error("usage: tsx gen-voice.ts <script.json> [publicDir]");
    process.exit(1);
  }

  const alive = await voicevoxAlive();
  if (!alive) {
    console.error("❌ VOICEVOX が localhost:50021 で応答しません。エンジンを起動してください。");
    process.exit(1);
  }

  const { readFileSync } = await import("node:fs");
  const script: Script = JSON.parse(readFileSync(scriptPath, "utf8"));

  console.log(`▶ 台本:「${script.title}」 ${script.scenes.length} シーン`);
  console.log(`  出力先: ${outDir}`);
  console.log(`  変換辞書: scripts/poc-video/tts-dict.json\n`);

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    const pad = String(i).padStart(2, "0");
    const wav = join(outDir, `voice-${pad}.wav`);
    const original = scene.narration;
    const normalized = normalizeNarration(original);

    if (original !== normalized) {
      console.log(`  [${pad}] 変換あり:`);
      console.log(`        元: ${original}`);
      console.log(`        後: ${normalized}`);
    } else {
      console.log(`  [${pad}] 変換なし: ${original}`);
    }

    await zundamonToWav(normalized, wav);
    console.log(`       → ${wav}`);
  }

  console.log(`\n✅ 音声ファイルを ${script.scenes.length} 本生成しました`);
  console.log(`   Remotion で使うには durationSec を実尺(ffprobe)に合わせて Root.tsx を更新してください`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
