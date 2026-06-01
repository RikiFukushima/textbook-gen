---
section_id: "05-01"
chapter_id: "05"
title: variables — 構成をパラメータ化する
order: 1
estimated_minutes: 5
estimated_chars: 1435
learning_points:
  - variable ブロックで構成の値を外から差し替えられるようにする
  - type / default / description で変数の意図と制約を明示する
  - 変数値を渡す複数の方法(tfvars・コマンドライン・環境変数)と優先順位を理解する
tags:
  - terraform
  - variables
  - hcl
related_sections:
  - "04-03"
  - "05-02"
key_terms:
  - term: variable ブロック
    definition: 構成内で参照できる入力値を宣言する Terraform のブロック。外部から値を差し替えられる。
  - term: tfvars ファイル
    definition: 変数に渡す値をまとめて記述するファイル(terraform.tfvars など)。環境ごとの設定を切り替えるのに使う。
  - term: var.<名前>
    definition: 宣言した変数の値を構成内から参照するための記法。
---

## このセクションで学ぶこと

- variable ブロックで構成の値を外から差し替えられるようにする
- type / default / description で変数の意図と制約を明示する
- 変数値を渡す複数の方法(tfvars・コマンドライン・環境変数)と優先順位を理解する

## 値を直書きすると何が困るのか

前章までは、リージョンやインスタンスタイプ、CIDR ブロックといった値を `.tf` ファイルに直接書いてきました。学習中はそれで十分ですが、実務では同じ構成を「開発用」「本番用」と複数の環境で使い回すことがほとんどです。値を直書きしたままだと、環境ごとにファイルをコピーして数値だけ書き換える、という運用になり、修正漏れや取り違えの温床になります。

そこで使うのが **variable ブロック** です。構成の中で「ここは外から差し替えられる値」と宣言しておき、環境ごとに値だけを渡す形にします。コード本体は 1 つに保ったまま、入力値だけを切り替えられるようになります。

## variable ブロックを宣言する

変数は `variable` ブロックで宣言します。`type` で型、`default` で既定値、`description` で用途を書きます。

```hcl
variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 インスタンスのタイプ"
}

variable "region" {
  type        = string
  description = "リソースを作成する AWS リージョン"
}
```

宣言した変数は、構成内で `var.<名前>` という記法で参照します。

```hcl
provider "aws" {
  region = var.region
}

resource "aws_instance" "app" {
  ami           = "ami-xxxxxxxx"
  instance_type = var.instance_type
}
```

`default` を書いておくと、値を渡さなかったときにその既定値が使われます。`default` がない変数(上の `region` のように)は **必須の入力** となり、値を渡さないと `terraform plan` 実行時に対話的に聞かれます。`type` には `string` のほか `number` `bool` `list(string)` `map(string)` などが指定でき、想定外の型の値が渡されたときにエラーで早めに気づけます。

## 値を渡す方法と優先順位

宣言した変数に値を渡す方法は複数あります。よく使うのは次の 3 つです。

- **tfvars ファイル**: `terraform.tfvars` に `instance_type = "t3.small"` のように書く。`terraform.tfvars` は自動で読み込まれます。環境別に分けたいときは `prod.tfvars` のように作り、`-var-file=prod.tfvars` で指定します。
- **コマンドライン**: `terraform apply -var="instance_type=t3.large"` のように個別に渡す。一時的な上書きに便利です。
- **環境変数**: `TF_VAR_instance_type=t3.medium` のように `TF_VAR_` 接頭辞を付けた環境変数を使う。CI 環境などで使われます。

複数の方法で同じ変数に値が指定された場合、おおまかには **コマンドラインの -var / -var-file が最も強く**、次に自動読み込みの tfvars、環境変数、最後に `default` という順で優先されます。意図せず別の値が使われていると感じたら、より優先度の高い指定が残っていないかを疑ってください。

## まとめ

- variable ブロックで値を宣言し、`var.<名前>` で参照することで構成をパラメータ化できる。
- type / default / description を書くと、型チェック・既定値・意図の共有ができる。
- 値は tfvars・コマンドライン・環境変数で渡せ、コマンドライン指定が最優先される。
