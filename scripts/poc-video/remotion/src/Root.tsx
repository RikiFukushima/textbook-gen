import React from "react";
import { Composition, registerRoot } from "remotion";
import { QuestVideoComposition } from "./QuestComposition";
import { ScriptData } from "./types";

const QUEST_SCRIPT: ScriptData = {
  title: "LlamaIndexの設計思想(問い駆動版)",
  scenes: [
    {
      kind: "cover",
      caption: "RAGが遅い理由、\n知ってる？",
      narration: "ラグが遅い理由、知ってるのだ？実はラマインデックスが解いてる問題はエルエルエムじゃなくて索引設計だったのだ。",
      durationSec: 7.99,
    },
    {
      kind: "point",
      label: "設計の核心",
      caption: "RAG は\n索引設計だ",
      narration: "よくある誤解は「検索してエルエルエムにつなぐだけ」なのだ。でも実際は索引の設計こそが精度の鍵なのだ。",
      durationSec: 8.19,
      diagram: "comparison",
    },
    {
      kind: "point",
      label: "4ステップ",
      caption: "取込→索引化→検索→生成",
      narration: "取り込み、索引化、検索、生成。この4段階のどこでも自由に差し替えられるのが強みなのだ。",
      durationSec: 7.81,
      diagram: "flow",
    },
    {
      kind: "point",
      label: "LangChainとの違い",
      caption: "連鎖 vs 索引\n主役が違う",
      narration: "ラングチェーンとの違いで迷う人も多いのだ。でも目的が違うのだ。ラングチェーンは処理フローの連結、ラマインデックスは索引設計が主役。競合じゃなくて使い分けるものなのだ。",
      durationSec: 12.61,
      diagram: "versus",
    },
    {
      kind: "hook",
      caption: "続きは本文で。",
      narration: "あなたのラグはどの型なのだ？索引設計のくわしいやり方は本文で確かめるのだ。",
      durationSec: 5.87,
    },
  ],
};

const QUEST_AUDIO: string[] = [
  "quest/voice-00.wav",
  "quest/voice-01.wav",
  "quest/voice-02.wav",
  "quest/voice-03.wav",
  "quest/voice-04.wav",
];

const FPS = 30;

function totalFrames(script: ScriptData): number {
  return script.scenes.reduce((s, sc) => s + Math.ceil(sc.durationSec * FPS), 0);
}

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="QuestVideo"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(QUEST_SCRIPT)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: QUEST_SCRIPT,
        audioFiles: QUEST_AUDIO,
      }}
    />
  </>
);

registerRoot(RemotionRoot);
