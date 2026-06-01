---
section_id: "02-04"
chapter_id: "02"
title: 最初のリソースを作って消す
order: 4
estimated_minutes: 5
estimated_chars: 1058
learning_points:
  - 最小構成の .tf を書いて実際にリソースを 1 つ作れる
  - apply の出力からリソースが作成されたことを確認できる
  - destroy で作ったリソースを安全に片付けられる
tags:
  - Terraform
  - ハンズオン
  - destroy
related_sections:
  - "02-02"
  - "02-03"
key_terms:
  - term: terraform destroy
    definition: Terraform が管理しているリソースをすべて削除するコマンド。apply と同様に確認を挟んでから実行される。
  - term: 冪等性
    definition: 同じ操作を何度行っても結果が変わらない性質。Terraform は設定と現状が一致していれば、再度 apply しても何も変更しない。
---

## このセクションで学ぶこと

- 最小構成の .tf を書いて実際にリソースを 1 つ作れる
- apply の出力からリソースが作成されたことを確認できる
- destroy で作ったリソースを安全に片付けられる

## 最小構成の設定を書く

ここまでの内容を使って、実際にリソースを 1 つ作ってみましょう。課金や削除の手間が小さい例として、ここでは S3 バケットを 1 つだけ作ります。空のディレクトリに `main.tf` を作り、次の内容を書きます。

```hcl
provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "first" {
  bucket = "my-first-tf-bucket-20260601"
}
```

S3 バケット名は世界中で一意である必要があるため、日付や自分の識別子を混ぜて重複しないようにします。

## 作って確認する

ワークフローのとおり、初期化してから差分を見て適用します。

```bash
terraform init
terraform plan    # Plan: 1 to add
terraform apply   # yes と入力
# Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

`1 added` と表示されれば成功です。AWS のマネジメントコンソールで S3 を開くと、宣言したバケットができているのが確認できます。ここで試しにもう一度 `terraform apply` を実行してみてください。今度は `0 added, 0 changed, 0 destroyed` と表示されるはずです。これは設定と実際の状態が一致しているため、Terraform が「何もする必要がない」と判断したからです。この **冪等性**(同じ操作を何度行っても結果が変わらない性質)が、宣言的なツールである Terraform の大切な特徴です。

## destroy で片付ける

学習用に作ったリソースは、放置すると無駄な課金につながります。不要になったら `terraform destroy` で削除します。

```bash
terraform destroy   # yes と入力
# Destroy complete! Resources: 1 destroyed.
```

destroy も apply と同じく確認を挟み、`yes` と答えて初めて削除が実行されます。`1 destroyed` と出れば、Terraform が管理していたバケットは消えています。

## 注意点

destroy は **そのディレクトリで Terraform が管理しているリソースをまとめて削除する** コマンドです。練習用ディレクトリでは便利ですが、本番環境で安易に実行すると必要なリソースまで消えてしまいます。実行前には必ず plan(destroy 時にも削除対象が表示されます)で対象を確認する習慣をつけましょう。S3 バケットの中にオブジェクトが残っていると削除に失敗することもあるため、空にしてから destroy するのが確実です。

## まとめ

- 最小構成の `.tf` を書き、init → plan → apply で実際にリソースを作れる。
- 同じ設定で再度 apply しても変更が出ないのが冪等性。
- 不要になったら destroy で片付け、対象を plan で確認してから実行する。
