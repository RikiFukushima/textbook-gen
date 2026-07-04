---
section_id: "02-01"
chapter_id: "02"
title: Terraform のインストールと HCL の基本構文
order: 1
estimated_minutes: 5
estimated_chars: 1420
learning_points:
  - Terraform をインストールし、バージョンを確認できる
  - HCL の基本要素である block と argument を読み分けられる
  - 設定を書くファイル(.tf)とディレクトリの考え方を理解する
tags:
  - Terraform
  - HCL
  - インストール
related_sections:
  - "02-02"
  - "02-03"
key_terms:
  - term: HCL
    definition: HashiCorp Configuration Language の略。Terraform の設定を記述するための宣言的な言語で、人間が読み書きしやすい構文を持つ。
  - term: block
    definition: HCL の基本構造単位。種別を表すキーワードとラベル、波括弧で囲んだ本体からなり、その中に argument を並べて設定を表現する。
  - term: argument
    definition: block の中で `名前 = 値` の形で値を割り当てる記述。リソースやプロバイダの個々の設定項目を表す。
---

## このセクションで学ぶこと

- Terraform をインストールし、バージョンを確認できる
- HCL の基本要素である block と argument を読み分けられる
- 設定を書くファイル(.tf)とディレクトリの考え方を理解する

## Terraform をインストールする

Terraform は単一の実行ファイルとして配布されており、インストールはこのファイルをパスの通った場所に置くだけで完了します。macOS なら Homebrew、Windows なら winget や公式バイナリ、Linux ならパッケージマネージャか公式バイナリを使うのが一般的です。たとえば macOS では次のように導入できます。

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

インストールが終わったら、必ずバージョンを確認しておきます。

```bash
terraform version
# Terraform v1.x.x
```

バージョンが表示されれば成功です。Terraform は後方互換性に敏感なツールなので、チームで作業するときは全員のバージョンをそろえておくとトラブルを避けられます。

## HCL の基本構文 — block と argument

Terraform の設定は **HCL(HashiCorp Configuration Language)** という言語で書きます。HCL は「何をどういう状態にしたいか」を宣言的に記述するための言語で、構造はとてもシンプルです。基本要素は **block** と **argument** の 2 つだけと考えて差し支えありません。

```hcl
resource "aws_s3_bucket" "example" {
  bucket = "my-first-terraform-bucket"
  tags = {
    Environment = "dev"
  }
}
```

この例で全体を波括弧で囲んでいるのが **block** です。`resource` が block の種別(キーワード)で、続く `"aws_s3_bucket"` と `"example"` が block を識別するためのラベルです。波括弧の中に並ぶ `bucket = "..."` のような `名前 = 値` の記述が **argument** で、その block の具体的な設定値を表します。`tags` のように、argument の値として波括弧で囲んだ入れ子の構造(ブロックやマップ)を取れる点も覚えておきましょう。

つまり HCL を読むときは、「これは何の block か(種別とラベル)」と「中にどんな argument が並んでいるか」の 2 段階で見れば、たいていの設定は理解できます。

## ファイルとディレクトリの考え方

Terraform の設定は拡張子 `.tf` のファイルに書きます。ファイル名は自由ですが、`main.tf` `variables.tf` `outputs.tf` のように役割で分けるのが慣習です。重要なのは、Terraform は **コマンドを実行したディレクトリにある `.tf` ファイルをすべてまとめて 1 つの設定として扱う** という点です。ファイルを分けても内部的には結合されるため、分割はあくまで人間にとっての見やすさのためです。

## 注意点

HCL は YAML と違い、インデントの深さに意味はありません。しかし読みやすさのために、block の入れ子に合わせて 2 スペースでそろえるのが標準的なスタイルです。`terraform fmt` コマンドを使うと、この整形を自動で行えるので、迷ったら実行しておくとよいでしょう。

## まとめ

- Terraform は単一バイナリで、導入後は `terraform version` で確認する。
- HCL の構造は block(種別+ラベル+本体)と argument(`名前 = 値`)の 2 要素。
- 同じディレクトリの `.tf` ファイルは結合され、1 つの設定として扱われる。
