---
section_id: "04-03"
chapter_id: "04"
title: セキュリティグループと EC2 インスタンス
order: 3
estimated_minutes: 6
estimated_chars: 1215
learning_points:
  - セキュリティグループが EC2 への通信を制御するファイアウォールであることを理解する
  - ingress / egress ルールを HCL で記述できる
  - aws_instance で EC2 を起動する最小構成を組める
tags:
  - aws
  - ec2
  - security-group
  - firewall
related_sections:
  - "04-02"
  - "04-04"
key_terms:
  - term: セキュリティグループ
    definition: EC2 などに紐づく仮想ファイアウォール。許可ルールのみを定義し、明示しない通信は拒否される。
  - term: ingress / egress
    definition: ingress は外から内への受信ルール、egress は内から外への送信ルール。
  - term: AMI
    definition: Amazon Machine Image。EC2 を起動する元になる OS やソフトウェアのテンプレート。
---

## このセクションで学ぶこと

- セキュリティグループが EC2 への通信を制御するファイアウォールであることを理解する
- `ingress` / `egress` ルールを HCL で記述できる
- `aws_instance` で EC2 を起動する最小構成を組める

## セキュリティグループ — 許可だけを書くファイアウォール

ネットワークの経路が通っても、EC2 への通信は **セキュリティグループ(SG)** で許可しない限り届きません。SG は EC2 などに紐づく仮想ファイアウォールで、大事な特徴は **「許可ルール(allow)だけを書く」** という点です。明示的に許可していない通信はすべて拒否されます。拒否ルールという概念がないので、「何を通すか」だけを考えれば済みます。

ルールは方向で 2 種類あります。外から EC2 への受信が **ingress**、EC2 から外への送信が **egress** です。たとえば SSH でログインしたいなら「ポート 22 番の ingress を許可」します。

```hcl
resource "aws_security_group" "ssh" {
  name   = "tf-handson-ssh"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

`egress` の `protocol = "-1"` は「全プロトコル」を意味し、ここでは外向き通信をすべて許可しています(パッケージ取得などに必要)。

## EC2 インスタンスを起動する

SG ができたら、EC2 本体を `aws_instance` で定義します。

```hcl
resource "aws_instance" "web" {
  ami                         = "ami-0abcdef1234567890"
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ssh.id]
  associate_public_ip_address = true

  tags = {
    Name = "tf-handson-web"
  }
}
```

`ami` は起動元のイメージ、`instance_type` はスペック、`subnet_id` でどのサブネットに置くか、`vpc_security_group_ids` で適用する SG を指定します。`associate_public_ip_address = true` で外部からアクセスできるパブリック IP が割り当てられます。これで「VPC → サブネット → 経路 → SG → EC2」がすべてつながり、SSH で接続できる Web サーバが起動します。

## 注意点

- `cidr_blocks = ["0.0.0.0/0"]` で 22 番を開けると **世界中から SSH 接続可能**になります。学習用なら許容されますが、実務では自分の IP(`x.x.x.x/32`)に絞るのが鉄則です。
- `ami` の ID は **リージョンごとに異なります**。別リージョンの ID をそのまま使うとエラーになるため、実務では `data` ソースで最新 AMI を動的に取得することが多いです。
- SG は許可ルールしか書けません。「特定の IP を拒否したい」といった要件は SG では実現できず、ネットワーク ACL など別の仕組みを使います。

## まとめ

- セキュリティグループは許可ルールだけを書く仮想ファイアウォールで、ingress が受信・egress が送信です。
- `aws_instance` は `ami` / `instance_type` / `subnet_id` / `vpc_security_group_ids` が要点です。
- SSH を `0.0.0.0/0` で開けっ放しにせず、実務では接続元 IP を絞ります。
