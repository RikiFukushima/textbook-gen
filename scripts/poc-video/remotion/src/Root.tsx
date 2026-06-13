// ⚠️  このファイルは gen-root.ts が自動生成します。直接編集しないこと。
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

// ━━ 01-01-llamaindex-design-quest: LlamaIndexの設計思想(問い駆動版) ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0101LlamaindexDesignQuest =   {
    "_comment": "D案「問い駆動型」台本。冒頭の問いかけ→誤解の提示→認識の逆転→使い分けの結論→問いで締める構成。narrationはずんだもんに渡す話し言葉。",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/01-llamaindex-design.md",
    "title": "LlamaIndexの設計思想(問い駆動版)",
    "scenes": [
      {
        "kind": "cover",
        "caption": "RAGが遅い理由、\n知ってる？",
        "narration": "RAGが遅い理由、知ってるのだ？実はLlamaIndexが解いてる問題はLLMじゃなくて索引設計だったのだ。"
      },
      {
        "kind": "point",
        "label": "設計の核心",
        "caption": "RAG は\n索引設計だ",
        "narration": "よくある誤解は「検索してLLMにつなぐだけ」なのだ。でも実際は索引の設計こそが精度の鍵なのだ。"
      },
      {
        "kind": "point",
        "label": "4ステップ",
        "caption": "取込→索引化→検索→生成",
        "narration": "取り込み、索引化、検索、生成。この4段階のどこでも自由に差し替えられるのが強みなのだ。"
      },
      {
        "kind": "point",
        "label": "LangChainとの違い",
        "caption": "連鎖 vs 索引\n主役が違う",
        "narration": "LangChainとの違いで迷う人も多いのだ。でも目的が違うのだ。LangChainは処理フローの連結、LlamaIndexは索引設計が主役。競合じゃなくて使い分けるものなのだ。"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのRAGはどの型なのだ？索引設計のくわしいやり方は本文で確かめるのだ。"
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-01: LlamaIndexの設計思想 — なぜIndex中心の抽象なのか ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0101 =   {
    "title": "LlamaIndexの設計思想 — なぜIndex中心の抽象なのか",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/01-llamaindex-design.md",
    "scenes": [
      {
        "kind": "cover",
        "caption": "LlamaIndex、\n何を解いてるの？",
        "narration": "LlamaIndexって検索ツールだと思ってない？実は解いてるのは索引設計の問題なのだ。知らないと本番RAGで詰まるのだ。",
        "durationSec": 8.69
      },
      {
        "kind": "point",
        "label": "Indexが中心の理由",
        "caption": "RAGの本質は\n索引設計だ",
        "narration": "よくある誤解は「検索してLLMに渡すだけ」なのだ。LlamaIndexはそれ以前の「どう整理して問い合わせ可能にするか」をIndexという抽象で前面に出しているのだ。",
        "durationSec": 12.59,
        "diagram": "comparison"
      },
      {
        "kind": "point",
        "label": "4段階パイプライン",
        "caption": "取込→索引化\n→検索→生成",
        "narration": "処理は4段階に分かれるのだ。取り込み、索引化、検索、生成。それぞれ独立した抽象が担当するから、どこでも差し替えられるのだ。",
        "durationSec": 10.78,
        "diagram": "flow"
      },
      {
        "kind": "point",
        "label": "LangChainとの違い",
        "caption": "連鎖 vs 索引\n主役が違う",
        "narration": "LangChainはLLM連鎖が主役、LlamaIndexはIndex設計が主役なのだ。同じRAGでもコードの主役が違うのだ。競合じゃなく使い分けるものなのだ。",
        "durationSec": 11.25,
        "diagram": "versus"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのRAGのIndexはどの型なのだ？使い分けのくわしい話は本文で確かめるのだ。",
        "durationSec": 6.25
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-02: Document / Node / Index の関係 — データモデルを理解する ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0102 =   {
    "_comment": "D案「問い駆動型」台本。Document直接ベクトル化という誤解を崩し、Document→Node→Indexの3階層とNodeのメタデータ設計の重要性を伝える。",
    "section_id": "01-02",
    "title": "Document / Node / Index の関係 — データモデルを理解する",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/02-document-node-index.md",
    "scenes": [
      {
        "kind": "cover",
        "caption": "Documentをそのまま\nベクトル化してる？",
        "narration": "DocumentをそのままベクトルDBに入れてると思ってない？実はNodeに分割してから格納するのだ。この違いが精度を決めるのだ。",
        "durationSec": 8.97
      },
      {
        "kind": "point",
        "label": "3階層の流れ",
        "caption": "Document→Node\n→Index",
        "narration": "データはDocument、Node、Indexの3階層で流れるのだ。検索でヒットするのはNodeで、LLMに渡るのもNodeのテキストなのだ。",
        "durationSec": 10.18,
        "diagram": "flow"
      },
      {
        "kind": "point",
        "label": "Nodeの力",
        "caption": "メタデータ＋\n関係情報",
        "narration": "NodeはメタデータとNode間の関係情報を持てるのだ。出典の追跡、検索フィルタ、前後の文脈補足。この3つが回答の質を底上げするのだ。",
        "durationSec": 11.31,
        "diagram": "none"
      },
      {
        "kind": "point",
        "label": "設計の注意点",
        "caption": "盛りすぎは\n逆効果",
        "narration": "メタデータは便利だが盛りすぎは逆効果なのだ。LLMに見せる情報と検索にだけ使う情報を分けて設計するのが、精度を守るコツなのだ。",
        "durationSec": 10.05,
        "diagram": "comparison"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのNodeのメタデータ、ちゃんと設計してるのだ？詳しい設計の仕方は本文で確かめるのだ。",
        "durationSec": 6.95
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-03: Node Parserとチャンキング戦略（問い駆動版） ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0103 =   {
    "_comment": "D案「問い駆動型」台本。誤解（RAGの精度はLLMの問題）→逆転（実は分割の仕方）→3種Parser比較→設計指針＋落とし穴→問いで締める構成。",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/03-node-parser-chunking.md",
    "title": "Node Parserとチャンキング戦略（問い駆動版）",
    "scenes": [
      {
        "kind": "cover",
        "caption": "RAGの精度が低い原因、\nどこを疑う？",
        "narration": "RAGの精度が低いとき、LLMのモデルを疑ってないのだ？実は原因の多くは「ドキュメントの切り方」にあるのだ。",
        "durationSec": 8.81
      },
      {
        "kind": "point",
        "label": "精度の真犯人",
        "caption": "分割の仕方が\n精度を決める",
        "narration": "答えが複数のNodeに分散していたり、Nodeが大きすぎて検索の解像度が落ちたりする。Node Parserの設計が検索精度に直結するのだ。",
        "durationSec": 10.42,
        "diagram": "comparison"
      },
      {
        "kind": "point",
        "label": "3種のParser",
        "caption": "Sentence / Token\n/ Semantic",
        "narration": "代表的なParserは3種なのだ。文単位で束ねるSentenceSplitter、トークン数を厳密に守るTokenTextSplitter、意味の切れ目で分けるSemanticSplitter。まずSentenceSplitterから始めるのが定石なのだ。",
        "durationSec": 15.43,
        "diagram": "versus"
      },
      {
        "kind": "point",
        "label": "設計の指針",
        "caption": "chunk_size 512\noverlapは10〜20%",
        "narration": "出発点はchunk_sizeを512前後、overlapはその10〜20%なのだ。Semantic Splitterは強力だけど、取り込み時に埋め込み計算のコストが乗るのだ。構造化されたMarkdownならSentenceSplitterで十分なことが多いのだ。",
        "durationSec": 18.33,
        "diagram": "flow"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのドキュメント、どのParserが合うのだ？設計の詳しい指針は本文で確かめるのだ。",
        "durationSec": 6.54
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-04: Retrieverの種類と使い分け — Vector / Keyword / Hybrid ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0104 =   {
    "_comment": "D案「問い駆動型」台本。冒頭の誤解型フック→Vector/Keyword対比→得意パターンの使い分け→パラメータ注意点→問いで締める構成。narrationはずんだもんに渡す話し言葉。",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/04-retriever-types.md",
    "title": "Retrieverの種類と使い分け — Vector / Keyword / Hybrid",
    "scenes": [
      {
        "kind": "cover",
        "caption": "キーワード検索って\n古くない？",
        "narration": "キーワード検索って古くない？って思ってるのだ？実はそれ、RAGで一番詰まるパターンなのだ。",
        "durationSec": 7.24
      },
      {
        "kind": "point",
        "label": "3種類の違い",
        "caption": "Vector vs Keyword\nvs Hybrid",
        "narration": "VectorはクエリをベクトルにしてNode同士の意味の近さで引くのだ。KeywordはBM25で単語の一致で引くのだ。HybridはこのふたつをRRFでまとめて使うのだ。",
        "durationSec": 11.57,
        "diagram": "comparison"
      },
      {
        "kind": "point",
        "label": "得意な質問パターン",
        "caption": "言い換え vs 固有名詞\nどちらが効く？",
        "narration": "「動作が重い」と「パフォーマンスが悪い」を同一視したいならVectorなのだ。PostgreSQLやコマンド名を確実に引きたいならKeywordなのだ。両方混ざるならHybridが安全なのだ。",
        "durationSec": 13.54,
        "diagram": "versus"
      },
      {
        "kind": "point",
        "label": "パラメータの勘どころ",
        "caption": "top_k=5 から\n評価で調整",
        "narration": "Top-Kを増やすと取りこぼしは減るがノイズも増えるのだ。出発点はtop_k=5前後なのだ。HybridはBM25が日本語で素直に動かないから、トークナイザの設定を確認するのだ。",
        "durationSec": 13.87,
        "diagram": "none"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのRAGにはどのRetrieverが合うのだ？評価データで比べる方法は本文で確かめるのだ。",
        "durationSec": 6.36
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-05: Query Engine の構造 — 検索から生成までの組み立て ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0105 =   {
    "_comment": "D案「問い駆動型」台本。1行APIの誤解→パイプライン構造の提示→Postprocessorの役割→低レベル組み立ての意義→問いで締める構成。narrationはずんだもんに渡す話し言葉。",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/05-query-engine.md",
    "title": "Query Engine の構造 — 検索から生成までの組み立て",
    "scenes": [
      {
        "kind": "cover",
        "caption": "1行で動くから\n中身は関係ない？",
        "narration": "as_query_engineの1行の裏に精度を決める3段パイプラインが隠れてるのだ。",
        "durationSec": 6.37
      },
      {
        "kind": "point",
        "label": "3段パイプライン",
        "caption": "検索→後処理→生成\nの順で動く",
        "narration": "内部はRetriever、Node Postprocessor、Response Synthesizerの順なのだ。どの段で問題が起きてるかを切り分けると解決が早いのだ。",
        "durationSec": 10.49,
        "diagram": "flow"
      },
      {
        "kind": "point",
        "label": "Postprocessorの定石",
        "caption": "広く拾って\n厳しく絞る",
        "narration": "top_kを10で広く拾い、similarity_cutoffで低品質なNodeを捨てるのだ。これだけでハルシネーションが減るのだ。",
        "durationSec": 8.01,
        "diagram": "comparison"
      },
      {
        "kind": "point",
        "label": "高レベル vs 低レベル",
        "caption": "APIは出発点、\n本番は組み立てる",
        "narration": "本番品質を出すにはRetrieverQueryEngineで部品を明示的に組み立て、source_nodesを必ずUIに出すのだ。",
        "durationSec": 8.14,
        "diagram": "versus"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのQuery EngineにPostprocessorは入ってるのだ？詳しい組み立て方は本文で確かめるのだ。",
        "durationSec": 7.3
      }
    ]
  } as unknown as ScriptData;

// ━━ 01-06: Response Synthesizer — 検索結果を回答に統合する方式の選択 ━━
// biome-ignore lint: auto-generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCRIPT_0106 =   {
    "_comment": "D案「問い駆動型」台本。refine=高精度という誤解→compact優先の逆転→3モード使い分け→出典設計→問いで締める構成。narrationはずんだもんに渡す話し言葉。",
    "source": "textbooks/ai-agent-roadmap/curriculums/deep-dive/chapters/01/sections/06-response-synthesizer.md",
    "title": "Response Synthesizer — 検索結果を回答に統合する方式の選択",
    "scenes": [
      {
        "kind": "cover",
        "caption": "refineにすれば\n精度が上がる？",
        "narration": "refineにすれば精度が上がるって思ってない？実はそれ、コストを無駄に増やしてるだけかもしれないのだ。",
        "durationSec": 6.84
      },
      {
        "kind": "point",
        "label": "3つのモード",
        "caption": "3モードを\n使い分ける",
        "narration": "Response Modeは3種類なのだ。compactは1回で詰め込む最速モード、refineはNodeごとに磨く精度寄り、tree_summarizeは大量Node向けなのだ。",
        "durationSec": 10.47,
        "diagram": "flow"
      },
      {
        "kind": "point",
        "label": "トレードオフ",
        "caption": "まずcompact、\nそれから切替",
        "narration": "よくある誤解は「精度のためにrefine」なのだ。でもrefineはNode数ぶんだけLLM呼び出しが走るのだ。まずcompactで評価して、足りなければ切り替えるのが正解なのだ。",
        "durationSec": 12.38,
        "diagram": "comparison"
      },
      {
        "kind": "point",
        "label": "出典設計",
        "caption": "出典表示＋\nプロンプト設計",
        "narration": "source_nodesは必ず表示するのだ。プロンプトに「根拠がなければ分かりませんと答えて」と入れるだけでハルシネーションが目に見えて減るのだ。",
        "durationSec": 9.58,
        "diagram": "none"
      },
      {
        "kind": "hook",
        "caption": "続きは本文で。",
        "narration": "あなたのRAGのResponse Mode、何を選んでるのだ？使い分けのくわしい基準は本文で確かめるのだ。",
        "durationSec": 7.05
      }
    ]
  } as unknown as ScriptData;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 音声パス (auto-generated)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AUDIO_0101LlamaindexDesignQuest: string[] = [

];

const AUDIO_0101: string[] = [
  "01-01/voice-00.wav",
  "01-01/voice-01.wav",
  "01-01/voice-02.wav",
  "01-01/voice-03.wav",
  "01-01/voice-04.wav"
];

const AUDIO_0102: string[] = [
  "01-02/voice-00.wav",
  "01-02/voice-01.wav",
  "01-02/voice-02.wav",
  "01-02/voice-03.wav",
  "01-02/voice-04.wav"
];

const AUDIO_0103: string[] = [
  "01-03/voice-00.wav",
  "01-03/voice-01.wav",
  "01-03/voice-02.wav",
  "01-03/voice-03.wav",
  "01-03/voice-04.wav"
];

const AUDIO_0104: string[] = [
  "01-04/voice-00.wav",
  "01-04/voice-01.wav",
  "01-04/voice-02.wav",
  "01-04/voice-03.wav",
  "01-04/voice-04.wav"
];

const AUDIO_0105: string[] = [
  "01-05/voice-00.wav",
  "01-05/voice-01.wav",
  "01-05/voice-02.wav",
  "01-05/voice-03.wav",
  "01-05/voice-04.wav"
];

const AUDIO_0106: string[] = [
  "01-06/voice-00.wav",
  "01-06/voice-01.wav",
  "01-06/voice-02.wav",
  "01-06/voice-03.wav",
  "01-06/voice-04.wav"
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composition 登録
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="QuestVideo0101LlamaindexDesignQuest"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0101LlamaindexDesignQuest)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0101LlamaindexDesignQuest,
        audioFiles: AUDIO_0101LlamaindexDesignQuest,
      }}
    />
    <Composition
      id="QuestVideo0101"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0101)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0101,
        audioFiles: AUDIO_0101,
      }}
    />
    <Composition
      id="QuestVideo0102"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0102)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0102,
        audioFiles: AUDIO_0102,
      }}
    />
    <Composition
      id="QuestVideo0103"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0103)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0103,
        audioFiles: AUDIO_0103,
      }}
    />
    <Composition
      id="QuestVideo0104"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0104)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0104,
        audioFiles: AUDIO_0104,
      }}
    />
    <Composition
      id="QuestVideo0105"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0105)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0105,
        audioFiles: AUDIO_0105,
      }}
    />
    <Composition
      id="QuestVideo0106"
      component={QuestVideoComposition}
      durationInFrames={totalFrames(SCRIPT_0106)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: SCRIPT_0106,
        audioFiles: AUDIO_0106,
      }}
    />
  </>
);

registerRoot(RemotionRoot);
