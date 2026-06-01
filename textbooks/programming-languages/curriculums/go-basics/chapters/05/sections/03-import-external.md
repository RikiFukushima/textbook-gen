---
section_id: "05-03"
chapter_id: "05"
title: 外部パッケージの導入と import
order: 3
estimated_minutes: 5
estimated_chars: 1093
learning_points:
  - go get で外部パッケージを依存に追加できる
  - import 文の書き方とエイリアスの使い方を理解する
  - go mod tidy で依存を整理できる
tags:
  - go
  - import
  - dependency
related_sections:
  - "05-02"
  - "05-04"
key_terms:
  - term: go get
    definition: 外部モジュールを取得して go.mod の依存に追加するコマンド。
  - term: import
    definition: 他のパッケージを読み込んで、その公開された識別子を使えるようにする宣言。
  - term: go mod tidy
    definition: 実際に使われている依存だけを残し、不要な依存を取り除いて go.mod / go.sum を整えるコマンド。
---

## このセクションで学ぶこと

- `go get` で外部パッケージを依存に追加できる
- `import` 文の書き方とエイリアスの使い方を理解する
- `go mod tidy` で依存を整理できる

## 外部パッケージを取り込む

標準ライブラリだけでなく、世界中で公開されている外部パッケージも簡単に使えます。手順は「`go get` で取得し、`import` で読み込む」の 2 ステップです。

たとえば一意な ID を生成する `github.com/google/uuid` を使うとします。プロジェクトのディレクトリで次を実行すると、モジュールがダウンロードされ、`go.mod` の `require` に追記されます。

```bash
go get github.com/google/uuid
```

あとはコードで `import` するだけです。import パスはモジュール名(取得時のパス)と一致します。

```go
package main

import (
    "fmt"

    "github.com/google/uuid"
)

func main() {
    id := uuid.New()
    fmt.Println(id.String())
}
```

`import` のかっこ内では、慣例として **標準ライブラリ → 空行 → 外部パッケージ** の順に並べます。`gofmt` がこの並びを自動で整えてくれます。

## import のエイリアスと特別な書き方

import にはいくつかの書き方があります。パッケージ名が衝突するときや長いときは、**エイリアス** を付けて別名で呼べます。

```go
import (
    crand "crypto/rand"   // crand という別名にする
    "math/rand"           // こちらは rand のまま
)
```

また、副作用(初期化処理)だけが目的でパッケージの識別子は使わない場合は、`_`(ブランク識別子)を付けます。これは「import したけど直接は使わない」という宣言で、未使用 import のエラーを避けつつ初期化だけ走らせたいときに使います。

## go mod tidy で依存を整える

開発を進めると、使わなくなった依存が `go.mod` に残ったり、逆に必要な依存が抜けたりします。そこで `go mod tidy` を実行すると、**実際に import されているものだけ** を残すように go.mod と go.sum を整理してくれます。

```bash
go mod tidy
```

コミット前に一度回しておくと、依存が常にクリーンに保たれます。

## 注意点

Go では **import したのに使っていないパッケージはコンパイルエラー** になります(変数の未使用と同じ思想です)。お試しで import を残したいときは、一時的に `_` を付けるか、不要なら削除しましょう。また `go get` でバージョンを指定したいときは `go get github.com/google/uuid@v1.6.0` のように `@バージョン` を付けます。

## まとめ

- `go get` で外部モジュールを取得し、`import` で読み込んで使う。
- エイリアスで別名を付けられ、`_` import は初期化目的の特別な書き方。
- 未使用 import はエラー。`go mod tidy` で依存を整理する。
