---
section_id: "05-02"
chapter_id: "05"
title: outputs — 値を取り出す
order: 2
estimated_minutes: 4
estimated_chars: 1048
learning_points:
  - output ブロックで構成が生成した値を外に取り出す
  - 作成後に確定する属性(IP・ID 等)を outputs で参照可能にする
  - sensitive 指定で機密値の表示を抑制する
tags:
  - terraform
  - outputs
  - hcl
related_sections:
  - "05-01"
  - "05-03"
key_terms:
  - term: output ブロック
    definition: 構成が生成した値に名前を付けて外部に公開する Terraform のブロック。apply 後に表示され、module 間の値の受け渡しにも使う。
  - term: terraform output
    definition: 構成が出力した値を後から確認するためのコマンド。スクリプトから値を取り出すのにも使える。
  - term: sensitive
    definition: 出力値を画面やログに表示しないよう抑制する属性。パスワードなどの機密値に使う。
---

## このセクションで学ぶこと

- output ブロックで構成が生成した値を外に取り出す
- 作成後に確定する属性(IP・ID 等)を outputs で参照可能にする
- sensitive 指定で機密値の表示を抑制する

## 作ったあとに知りたい値をどう拾うか

variables が「外から渡す入力」だとすれば、**outputs は構成の外に返す出力** です。インスタンスのパブリック IP やリソースの ID のように、`apply` してみて初めて確定する値があります。こうした値は AWS マネジメントコンソールを開けば確認できますが、毎回探すのは手間ですし、自動化にも向きません。output ブロックを書いておけば、`apply` 完了時に必要な値がまとめて画面に表示されます。

## output ブロックを書く

出力したい値は `output` ブロックで宣言します。`value` に参照したい属性を書きます。

```hcl
output "instance_public_ip" {
  value       = aws_instance.app.public_ip
  description = "起動した EC2 のパブリック IP"
}

output "vpc_id" {
  value = aws_vpc.main.id
}
```

`apply` が終わると、次のように出力されます。

```
Outputs:

instance_public_ip = "203.0.113.10"
vpc_id = "vpc-0abc123def456"
```

一度 apply したあとに値を見たくなったら、`terraform output` コマンドで確認できます。`terraform output instance_public_ip` のように名前を指定すれば 1 つだけ取り出せ、`terraform output -raw instance_public_ip` を使うとクォートなしの生の値が得られるため、シェルスクリプトやコマンドの引数に渡すのに便利です。

## 機密値は sensitive で隠す

データベースのパスワードや認証トークンなど、画面やログに出したくない値もあります。たとえば `random_password` リソースで生成したパスワードを出力する場合です。その場合は `sensitive = true` を付けます。

```hcl
output "db_password" {
  value     = random_password.db.result
  sensitive = true
}
```

`sensitive` を付けると、`apply` 時の表示は `db_password = (sensitive value)` となり、実際の値は隠されます。値そのものは state ファイルには平文で保存される点に注意してください。出力の抑制はあくまで「画面・ログへの露出を防ぐ」ものであり、state の保護は別途必要です(詳しくは第 6 章で扱います)。

## まとめ

- output ブロックで、apply 後に確定する値(IP・ID 等)を取り出して表示できる。
- `terraform output` で後から値を確認でき、`-raw` でスクリプトに渡せる。
- 機密値には sensitive を付けて表示を抑制するが、state には平文で残る点に注意する。
