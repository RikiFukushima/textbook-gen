---
section_id: "01-06"
chapter_id: "01"
title: Response Synthesizer — 検索結果を回答に統合する方式の選択
order: 6
estimated_minutes: 4
estimated_chars: 1653
learning_points:
  - 代表的な Response Mode(refine / compact / tree_summarize)の違いを説明できる
  - コンテキスト長と精度・コストのトレードオフを判断できる
  - 出典付き回答を返すための設計ポイントを掴む
tags:
  - llamaindex
  - response-synthesizer
  - rag
related_sections:
  - "01-05"
  - "01-02"
key_terms:
  - term: Response Synthesizer
    definition: 検索で取得した複数の Node を LLM に渡し、最終的な回答テキストを組み立てるコンポーネント。
  - term: response_mode
    definition: Response Synthesizer の合成戦略を選ぶパラメータ。refine / compact / tree_summarize などがある。
  - term: context window
    definition: LLM が 1 回の呼び出しで読み込めるトークン数の上限。これを超える Node 群はまとめ方の工夫が必要。
---

## このセクションで学ぶこと

- 代表的な Response Mode(refine / compact / tree_summarize)の違いを説明できる
- コンテキスト長と精度・コストのトレードオフを判断できる
- 出典付き回答を返すための設計ポイントを掴む

## なぜ「合成方式」が必要なのか

検索でヒットした Node を **どうやって LLM に渡すか** には複数のやり方があります。「全部つなげて 1 回で投げる」「1 つずつ順に渡して回答を磨いていく」「木構造でまとめてから最後に合成する」など、それぞれメリットとデメリットが違います。LlamaIndex はこの戦略を **Response Mode** という名前で切り替え可能にしています。

代表的な 3 つは次のとおりです。

- **`compact`**(既定): できるだけ多くの Node を 1 つのプロンプトに詰めて 1 回の LLM 呼び出しで回答を作る。コンテキストに収まる範囲なら最も速く安い。
- **`refine`**: 最初の Node で初期回答を作り、次の Node で「既存回答を改善する」よう LLM に指示する。これを Node ぶん繰り返す。Node 数だけ呼び出しが走るが、長文要約や複数 Node を統合した回答に強い。
- **`tree_summarize`**: Node を 2〜3 つずつグループにして要約し、その要約をさらに要約する木構造アプローチ。100 件以上の Node を扱うときに現実的な選択肢になる。

```python
from llama_index.core.response_synthesizers import get_response_synthesizer

# 1 回呼び出しで詰め込む(最速・最安)
compact = get_response_synthesizer(response_mode="compact")

# Node ごとに回答を磨く(精度寄り・コスト高)
refine = get_response_synthesizer(response_mode="refine")

# 木構造で要約(大量 Node 向け)
tree = get_response_synthesizer(response_mode="tree_summarize")
```

## 具体例 — どれを選ぶか

実務での選び方は、**Top-K と Node のサイズ、そしてタスクの性質** で決まります。

- **FAQ 的な単発質問 + `top_k=3〜5`**: `compact` でほぼ問題ない。速くて安く、十分な精度が出る。
- **長文の要約・複数文書の統合**: `refine` が向く。「既存回答 + 次の Node → 改善版回答」というプロンプトを使うため、追加情報を取り込みやすい。
- **数十〜数百 Node を一度に扱う**: `tree_summarize` 一択。`compact` ではコンテキスト長を超え、`refine` では呼び出し回数が爆発する。

注意したいのは、**`refine` と `tree_summarize` は LLM 呼び出し回数が増える** 点です。`refine` で `top_k=10` なら 10 回前後の呼び出しが走り、レイテンシもコストも線形に増えます。「精度のために refine」と短絡せず、まず compact で十分かを評価してから切り替えるのが安全です。

## 注意点 — 出典付き回答と Prompt Template

Response Synthesizer は **出典(source_nodes)を回答とセットで返す** 設計になっています。前節でも触れたとおり、UI ではこの `source_nodes` を必ず引用として表示してください。引用が消えた RAG は、検索なしの LLM 単体と区別がつかなくなります。

もう一つ大事なのは **Prompt Template のカスタマイズ** です。既定のテンプレートは英語ベースで、日本語回答が欲しい場合は「日本語で答えてください」「文末はですます調にしてください」「コンテキストに根拠がない場合は『分かりません』と答えてください」といった指示を入れた専用テンプレートを渡します。`text_qa_template` と `refine_template` の 2 種類があり、Response Mode に応じて使い分けられます。

```python
from llama_index.core import PromptTemplate

qa_template = PromptTemplate(
    "以下のコンテキストを参考にして、日本語のですます調で簡潔に答えてください。\n"
    "コンテキストに根拠がない場合は『分かりません』と答えてください。\n\n"
    "コンテキスト:\n{context_str}\n\n"
    "質問: {query_str}\n回答:"
)

synthesizer = get_response_synthesizer(
    response_mode="compact",
    text_qa_template=qa_template,
)
```

「根拠がなければ分からないと答える」という一文を入れるだけでハルシネーションが目に見えて減ります。安全装置として最初から仕込んでおくと良いでしょう。

## まとめ

- Response Mode は **コンテキスト量と呼び出し回数のトレードオフ** で選ぶ。
- まず `compact` で評価、必要に応じて `refine` / `tree_summarize` に切り替える。
- 出典の露出と「根拠がなければ分からない」プロンプトはハルシネーション抑制の基本装備。
