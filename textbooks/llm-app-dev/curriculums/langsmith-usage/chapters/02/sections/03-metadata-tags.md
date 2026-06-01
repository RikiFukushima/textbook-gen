---
section_id: "02-03"
chapter_id: "02"
title: メタデータ・タグで絞り込む
order: 3
estimated_minutes: 5
estimated_chars: 1247
learning_points:
  - run 名・タグ・メタデータの違いと、それぞれの使いどころを理解する
  - LangChain/LangGraph コードからメタデータやタグを付与する方法を知る
  - 付与した情報を使って LangSmith でトレースを検索・フィルタする
tags:
  - metadata
  - tags
  - filtering
related_sections:
  - "02-01"
  - "02-02"
  - "02-04"
key_terms:
  - term: タグ(tags)
    definition: Run に付ける短いラベルの集合。環境やバージョンなどで分類し、UI のフィルタで束ねて絞り込むために使う。
  - term: メタデータ(metadata)
    definition: Run に付与する任意のキー・バリュー情報。ユーザー ID やリクエスト ID など検索・分析の軸になる値を持たせる。
  - term: run 名(run_name)
    definition: Run に付ける表示用の名前。トレース一覧で処理を識別しやすくするために設定する。
---

## このセクションで学ぶこと

- run 名・タグ・メタデータの違いと、それぞれの使いどころを理解する
- LangChain/LangGraph コードからメタデータやタグを付与する方法を知る
- 付与した情報を使って LangSmith でトレースを検索・フィルタする

## なぜ「付けておく」ことが効くのか

トレースは放っておくと大量にたまります。本番で 1 日に数万件の Trace が記録される環境では、「あのユーザーの、あのバージョンで、エラーになったトレース」を後から探し出すのは至難です。そこで実行時に**検索の手がかり**を埋め込んでおくのが、run 名・タグ・メタデータです。

3 つは役割が異なります。

- **run 名(run_name)**: その Run の表示名。一覧で「どの処理か」を人が見て識別するために使います。
- **タグ(tags)**: 短いラベルの集合。`prod` / `staging`、`v2`、`experiment-a` のように**分類して束ねる**用途に向きます。
- **メタデータ(metadata)**: 任意のキー・バリュー。`user_id` や `request_id`、`tenant` のように**値で検索・分析する軸**を持たせます。

## コードから付与する

LangChain / LangGraph では、実行時の `config` に渡すのが基本です。`run_name`・`tags`・`metadata` を指定します。

```python
result = chain.invoke(
    {"question": user_question},
    config={
        "run_name": "support-qa",
        "tags": ["prod", "v2"],
        "metadata": {
            "user_id": user_id,
            "request_id": request_id,
        },
    },
)
```

ここで渡した値はルート Run に記録され、LangSmith の UI に反映されます。アプリ全体で `user_id` や環境名を一貫して付けておくと、後の調査が劇的に楽になります。

## UIで絞り込む

付与した情報は、トレース一覧の **Filter** で検索条件に使えます。たとえば次のような絞り込みが日常的に役立ちます。

- `tags` に `prod` を含み、ステータスが error のものだけ表示 → 本番の失敗だけを抽出
- `metadata.user_id` が特定の値 → 問い合わせのあったユーザーのトレースを再現確認
- run 名が `support-qa` のもの → 特定機能のトレースだけを集計

タグで母集団を絞り、メタデータで個別レコードに当てる、という組み合わせが実務の定石です。

## 注意点

メタデータに**個人情報や秘密情報をそのまま入れない**よう注意してください。LangSmith に送られて保存・表示されるため、メール本文や認証トークンなどは避け、ID やハッシュ化した値にとどめます。また、タグは増やしすぎると分類軸がぼやけるので、チームで命名規則(環境・バージョン・実験名など)を決めて運用すると検索性が保てます。

## まとめ

- run 名は識別、タグは分類して束ねる、メタデータは値で検索する軸、と役割が違う。
- 実行時の `config` に `run_name` / `tags` / `metadata` を渡してトレースに埋め込む。
- 個人情報・秘密情報はメタデータに入れず、ID やハッシュ値で代替する。
