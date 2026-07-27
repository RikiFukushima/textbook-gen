---
section_id: "02-04"
chapter_id: "02"
title: Ticketing API で書き戻す(コメント・内部メモ・タグ・カスタムフィールド)
order: 4
estimated_minutes: 5
estimated_chars: 1341
learning_points:
  - Ticketing API のチケット更新でコメント・タグ・custom fields をまとめて書き戻せることを理解する
  - AIドラフトは public: false の internal note として書き戻すのが安全設計だとつかむ
  - タグで「AI処理済み」を、custom field で参照ナレッジIDを記録する実務パターンを知る
tags: [zendesk, ticketing-api, 書き戻し, internal-note, api]
related_sections: ["02-01", "02-03"]
key_terms:
  - term: Ticketing API
    definition: チケットの作成・取得・更新を行うZendeskのREST API。メール的な非同期チケットを扱う。
  - term: internal note
    definition: 顧客に見えない内部メモ。コメント書き戻し時に public を false にすることで作成する。
---

## このセクションで学ぶこと

- Ticketing API でチケットにコメント・タグ・custom fields を書き戻す方法
- AI ドラフトを `internal note` として安全に書き戻すパターン
- タグと custom field で「処理の痕跡」を残す実務の型

## Ticketing API はチケット更新の口

Webhook で受け取ったチケットに対し、自前基盤から結果を戻す口が **Ticketing API** です。これはチケットの作成・取得・更新を行う REST API で、メールのように非同期でやり取りされるチケットを扱います。書き戻しでよく使うのは**チケット更新**の1本で、コメント追加・タグ変更・custom fields 更新を**同じ更新リクエストにまとめて**送れます。

最重要は **コメントを internal note として書き戻す**ことです。02-01 で見たとおり Comment には public/internal の区別があり、更新リクエストのコメント部分で `public: false` を指定すると顧客に見えない内部メモになります。AI が生成した返信ドラフトは、まずこの internal note に置き、人間が確認してから public として送る——これがタイプ3の基本の安全設計です。

```json
{
  "ticket": {
    "comment": {
      "body": "【AIドラフト】お問い合わせありがとうございます……",
      "public": false
    },
    "tags": ["ai-drafted"],
    "custom_fields": [
      { "id": 3600001, "value": "kb-article-482" }
    ]
  }
}
```

## タグと custom field で痕跡を残す

同じ更新で、タグと custom field も一緒に書けます。**タグ**は「この処理をした」という軽い印付けに向きます。上の例では `ai-drafted` を付け、「AI がドラフトを書き戻した」ことを示しています。これをトリガー条件に使えば、二重処理の防止や後続の自動化につなげられます。

**custom field** は構造化した値の記録に向きます。例では AI が生成の根拠にしたナレッジ記事 ID(`kb-article-482`)をフィールドに保存しています。あとで「なぜこの返信になったか」を追跡でき、根拠提示や評価の材料になります。タグが「付いた/付いてない」の目印なのに対し、custom field は「どの値か」を持てる、と使い分けると整理しやすいです。

この3つ(コメント・タグ・custom field)を1回の更新でまとめて送れるのは実装上ありがたい点です。ドラフト書き戻し・処理済みタグ付け・参照 ID 記録を別々の API 呼び出しに分けず、1リクエストで原子的に反映できるため、途中で失敗して中途半端な状態が残る事故を減らせます。

## 注意点

- **必ず `public: false` を明示**します。うっかり public にすると未検証の AI 出力が顧客へ直送されます。
- custom field はフィールド ID で指定します。ID は顧客環境ごとに異なるため、直書きせず設定として外に出しておくこと。
- closed のチケットは更新できません。書き戻す前に status を確認します。

## まとめ

- Ticketing API のチケット更新で、コメント・タグ・custom fields をまとめて書き戻せる
- AI ドラフトは `public: false` の internal note にするのが安全設計の要
- タグで処理済みを示し、custom field に参照ナレッジ ID を残すと追跡できる
