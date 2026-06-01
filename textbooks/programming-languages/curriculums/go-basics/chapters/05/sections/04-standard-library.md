---
section_id: "05-04"
chapter_id: "05"
title: 標準ライブラリを使ってみる(fmt / net/http ほか)
order: 4
estimated_minutes: 5
estimated_chars: 1149
learning_points:
  - Go の標準ライブラリが何を提供しているか俯瞰できる
  - fmt / strings / encoding/json など主要パッケージの役割を説明できる
  - net/http で簡単な HTTP サーバを書ける
tags:
  - go
  - standard-library
  - net-http
related_sections:
  - "05-01"
  - "05-03"
key_terms:
  - term: 標準ライブラリ
    definition: Go に最初から同梱されている、追加インストール不要で使えるパッケージ群。
  - term: net/http
    definition: HTTP サーバやクライアントを構築するための標準パッケージ。
  - term: encoding/json
    definition: Go の値と JSON を相互変換(エンコード・デコード)する標準パッケージ。
---

## このセクションで学ぶこと

- Go の標準ライブラリが何を提供しているか俯瞰できる
- `fmt` / `strings` / `encoding/json` など主要パッケージの役割を説明できる
- `net/http` で簡単な HTTP サーバを書ける

## 充実した標準ライブラリ

Go の大きな魅力の 1 つが、**追加インストールなしで使える標準ライブラリの充実** です。文字列処理から暗号、HTTP サーバ、JSON 変換まで、実務でよく必要になる機能の多くが最初から揃っています。外部パッケージに頼る前に、まず標準ライブラリで足りないかを確認するのが Go 流です。

よく使う代表的なパッケージを挙げます。

| パッケージ | 役割 |
| --- | --- |
| `fmt` | 文字列の整形・標準出力(`Println` など) |
| `strings` | 文字列の検索・置換・分割 |
| `strconv` | 文字列と数値の相互変換 |
| `os` | ファイル操作・環境変数・コマンドライン引数 |
| `encoding/json` | Go の値と JSON の相互変換 |
| `net/http` | HTTP サーバ・クライアント |

## net/http で HTTP サーバを書く

`net/http` を使うと、わずか数行で HTTP サーバが立ち上がります。フレームワークを入れなくてもこれだけ書ける、という点が Go らしさをよく表しています。

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello from Go!")
    })
    http.ListenAndServe(":8080", nil)
}
```

`HandleFunc` でパス `/` に対する処理を登録し、`ListenAndServe` でポート 8080 で待ち受けます。ブラウザで `http://localhost:8080` を開くと「Hello from Go!」が表示されます。

## encoding/json でデータを変換する

API を作るときに欠かせないのが JSON 変換です。`encoding/json` の `Marshal` で Go の構造体を JSON に変換できます。ここでも、第 1 章から続く「公開フィールドは大文字始まり」のルールが効いてきます。

```go
type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

b, _ := json.Marshal(User{Name: "Taro", Age: 20})
// b は {"name":"Taro","age":20}
```

フィールドの後ろの `json:"name"` は **構造体タグ** で、JSON 上のキー名を指定できます。

## 注意点

標準ライブラリの関数の多くは `error` を返します(第 3 章で学んだ作法どおりです)。上の例では簡潔さのため `_` で握りつぶしていますが、実務では必ずエラーを確認しましょう。また、何が標準で使えるかは公式ドキュメント(pkg.go.dev)で調べる習慣をつけると、外部依存を増やさずに済みます。

## まとめ

- 標準ライブラリは追加インストール不要で、実務に必要な機能が広く揃う。
- `net/http` だけで HTTP サーバが書け、`encoding/json` で JSON 変換ができる。
- 多くの関数は error を返すので、実務では必ずエラーを確認する。
