---
section_id: "02-02"
chapter_id: "02"
title: PromptTemplateで入力を組み立てる
order: 2
estimated_minutes: 4
estimated_chars: 1225
learning_points:
  - PromptTemplate / ChatPromptTemplate で変数を埋め込んだプロンプトを生成できる
  - テンプレート化することでプロンプトの再利用とテストが容易になる理由を理解する
  - format / invoke でテンプレートからメッセージを組み立てる流れを把握する
tags:
  - langchain
  - prompt
  - template
related_sections:
  - "02-01"
  - "02-03"
key_terms:
  - term: PromptTemplate
    definition: 変数を含むプロンプト文字列のひな形。入力値を渡すと変数を埋めた最終プロンプトを生成する。
  - term: ChatPromptTemplate
    definition: 複数の役割付きメッセージをまとめてテンプレート化し、変数を埋めてメッセージのリストを生成する仕組み。
  - term: 入力変数
    definition: テンプレート中の波括弧で囲まれたプレースホルダ。実行時に具体的な値で置き換えられる。
---

## このセクションで学ぶこと

- PromptTemplate / ChatPromptTemplate で変数を埋め込んだプロンプトを生成できる
- テンプレート化することでプロンプトの再利用とテストが容易になる理由を理解する
- format / invoke でテンプレートからメッセージを組み立てる流れを把握する

## プロンプトを「ひな形」として切り出す

LLM アプリでは、毎回ほぼ同じ文章の一部だけを差し替えてモデルに渡す場面がほとんどです。たとえば「次の文章を 1 行で要約してください: {text}」のように、固定の指示文と、実行時に変わる部分が混在します。この **変わる部分を変数(プレースホルダ)として切り出したひな形** が `PromptTemplate` です。

テンプレート化する利点は明確です。プロンプト文をコードのあちこちに文字列連結で散らかさずに済み、**再利用・差し替え・テスト** がしやすくなります。プロンプトの文言を改善したいときも、テンプレート 1 か所を直せば全呼び出しに反映されます。

## ChatPromptTemplate で役割付きメッセージを組み立てる

前のセクションで見たとおり、ChatModel にはメッセージのリストを渡します。そこで実務では、System / Human のメッセージごとテンプレート化できる `ChatPromptTemplate` をよく使います。

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "あなたは{language}で答える翻訳アシスタントです。"),
    ("human", "次の文を訳してください: {text}"),
])

# 変数を埋めてメッセージのリストを生成する
messages = prompt.invoke({"language": "日本語", "text": "Hello, world."})
print(messages.to_messages())
```

`prompt.invoke({...})` に **入力変数** を辞書で渡すと、`{language}` や `{text}` が実際の値に置き換わり、SystemMessage と HumanMessage のリストが生成されます。これをそのまま ChatModel に渡せば応答が得られます。文字列だけの単純なプロンプトなら `PromptTemplate.from_template("...{x}...")` を使い、`format` で文字列を得ることもできます。

## 注意点

テンプレートに渡す辞書のキーは、テンプレート中の変数名と **完全に一致** している必要があります。`{text}` と書いたのに `{"txt": ...}` を渡すとエラーになります。また、プロンプト本文中にそのまま波括弧 `{}` を書きたい場合(JSON の例を提示したいときなど)は `{{` `}}` とエスケープします。これを忘れると、波括弧の中身が未定義の変数として扱われ、思わぬエラーの原因になります。テンプレートは後続の LCEL(次セクション)でモデルやパーサーと連結する起点になるので、入出力の形をここで揃えておくことが大切です。

## まとめ

- PromptTemplate は変数を含むプロンプトのひな形で、再利用とテストを容易にする。
- ChatPromptTemplate は役割付きメッセージごとテンプレート化し、invoke で変数を埋める。
- 変数名は渡す辞書のキーと一致させ、本文中の波括弧は `{{ }}` でエスケープする。
