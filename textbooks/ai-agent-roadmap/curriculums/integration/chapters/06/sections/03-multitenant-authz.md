---
section_id: "06-03"
chapter_id: "06"
title: 認証・認可設計 — マルチテナント環境での Agent 設計
order: 3
estimated_minutes: 4
estimated_chars: 1612
learning_points:
  - JWT でユーザーとテナントの識別子を Agent 層まで伝搬する設計を組み立てられる
  - Tool 呼び出し時にユーザーコンテキストを明示的に渡す原則を実装に落とせる
  - RAG 検索でテナント越境を防ぐためのフィルタ必須化を設計できる
tags:
  - authentication
  - authorization
  - multi-tenancy
  - security
related_sections:
  - "06-01"
  - "06-02"
  - "06-04"
key_terms:
  - term: JWT
    definition: JSON Web Token。署名付きの JSON で、ユーザー ID やテナント ID などのクレームを安全に持ち回るための標準形式。
  - term: テナントフィルタ
    definition: データ参照クエリに「現在のテナントに属するレコードのみ」という条件を必ず差し込む仕組み。マルチテナント環境での情報漏洩対策の基本。
  - term: 最小権限の原則
    definition: ユーザー・サービス・Tool が実行に必要な最小限の権限だけを持つように設計する原則。
---

## このセクションで学ぶこと

- JWT でユーザーとテナントの識別子を Agent 層まで伝搬する設計を組み立てられる
- Tool 呼び出し時にユーザーコンテキストを明示的に渡す原則を実装に落とせる
- RAG 検索でテナント越境を防ぐためのフィルタ必須化を設計できる

## マルチテナント Agent で起きる事故

複数の組織・顧客が同じ Agent システムを使うとき、**最も致命的な事故は「他テナントのデータを見せてしまう」こと**です。SaaS であれば即インシデント・契約違反になる事象です。

LLM ベースの Agent は、自然言語の指示から動的に Tool を呼び出します。**「Agent に正しく振る舞ってほしい」と祈る設計では事故は止められません**。テナント分離は Agent の外側、つまり Tool と RAG の実装側で物理的に保証する必要があります。

## ステップ 1 — JWT で「誰として」アクセスしているかを運ぶ

入口の認証は、ユーザーが既存の IdP(Identity Provider)で認証した結果として JWT を発行する形が一般的です。JWT の **クレームには最低でも `sub`(ユーザー ID)と `tenant_id`(テナント ID)を含めます**。

```json
// JWT のペイロード例
{
  "sub": "user_abc123",
  "tenant_id": "tenant_xyz",
  "roles": ["coach"],
  "exp": 1735689600
}
```

この JWT は API Gateway / BFF でいったん検証し、**Agent オーケストレータには「検証済みのユーザーコンテキスト」として渡します**。Agent 自身に生の JWT を渡して検証させる設計は避けます(LLM に検証ロジックを任せると、プロンプトインジェクションで「自分は admin だ」と言わせるだけで突破されます)。

## ステップ 2 — Tool 呼び出しにユーザーコンテキストを明示的に渡す

Agent が Tool を呼ぶときの引数は、原則 **LLM が生成する「業務パラメータ」と、システムが付与する「ユーザーコンテキスト」を分離**します。

```python
# Tool 実装側のシグネチャ例
def search_documents(
    query: str,            # LLM が生成
    *,
    user_id: str,          # システムが付与(LLM からは変更不可)
    tenant_id: str,        # システムが付与(同上)
):
    # tenant_id を必ず WHERE 句に差し込む
    return db.query(
        "SELECT ... FROM docs WHERE tenant_id = %s AND ... ",
        (tenant_id, ...)
    )
```

ポイントは、**`tenant_id` を LLM が触れる位置に置かない**ことです。LangChain や LangGraph の Tool 定義であれば、LLM 入力のスキーマには `query` だけを露出し、`tenant_id` は実行時に runtime context から注入する形を取ります。これは **最小権限の原則**(実行に必要な最小限の権限だけを各コンポーネントに与える)を Agent に適用したもので、LLM には業務パラメータの生成権限しか渡さない、という切り分けです。

## ステップ 3 — RAG 検索にテナントフィルタを必須化する

ベクトル検索はメタデータフィルタを後付けで足せますが、**「フィルタを付け忘れる」という事故は構造的に防ぐ**必要があります。代表的なやり方は次のとおりです。

- **インデックス分離**: テナントごとに別インデックスを作る。物理分離なので越境事故が原理的に起きない。コストは増える。
- **論理分離 + 強制フィルタ**: 単一インデックスに `tenant_id` メタデータを持たせ、検索ライブラリのラッパー層で「`tenant_id` 指定がない検索クエリは実行しない」という assert を強制する。

```python
# 論理分離の実装例: tenant_id 未指定は実行時エラーにする
def vector_search(query_vec, *, tenant_id: str, top_k: int = 5):
    if not tenant_id:
        raise SecurityError("tenant_id is required for vector search")
    return index.query(
        vector=query_vec,
        filter={"tenant_id": tenant_id},
        top_k=top_k,
    )
```

迷ったらインデックス分離が安全側です。テナント数が爆発する SaaS なら論理分離 + 強制フィルタを採用し、**フィルタを忘れたコードがそもそも書けない API 設計**にします。

## 監査ログを最初から仕込む

事故が起きたあと、「誰がどのテナントのデータにいつアクセスしたか」を遡れるかどうかが、被害範囲の特定速度を決めます。Tool 呼び出しごとに `user_id` / `tenant_id` / `tool_name` / `arguments`(マスキング済み)/ `result_count` を構造化ログで残す設計を、**最初のリリースから入れて**おきます。後から足すと、抜けがある期間の調査ができません。

## まとめ

- 入口で JWT を検証し、ユーザーコンテキストは「検証済みオブジェクト」で Agent に渡す
- Tool の `tenant_id` は LLM の届かない位置でシステム注入する
- RAG はインデックス分離か、強制フィルタ付きラッパーで越境事故を構造的に防ぐ
