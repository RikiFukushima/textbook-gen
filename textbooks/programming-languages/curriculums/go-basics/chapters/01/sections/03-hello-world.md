---
section_id: "01-03"
chapter_id: "01"
title: Hello, World を書いて実行する
order: 3
estimated_minutes: 5
estimated_chars: 889
learning_points:
  - 最小の Go プログラムを書ける
  - package と import と func main の役割を理解する
  - go run でプログラムを実行できる
tags:
  - go
  - hello-world
  - 入門
related_sections:
  - "01-02"
  - "01-04"
key_terms:
  - term: package
    definition: Go のソースをまとめる単位。実行プログラムの入口となるファイルは package main にする。
  - term: import
    definition: 他のパッケージの機能を取り込む宣言。fmt などの標準ライブラリを使うときに書く。
  - term: func main
    definition: 実行プログラムが最初に呼び出す関数。プログラムの開始地点となる。
---

## このセクションで学ぶこと

- 最小の Go プログラムを書ける
- package と import と func main の役割を理解する
- go run でプログラムを実行できる

## 最初のプログラムを書く

任意のフォルダに `hello.go` というファイルを作り、次の内容を書きます。

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World")
}
```

たった 6 行ですが、Go プログラムに必要な要素がひととおり入っています。1 行ずつ意味を見ていきましょう。

## 各行の意味

`package main` は、このファイルが属する **パッケージ** の宣言です。実行できるプログラムの入口は、必ず `main` という名前のパッケージにします。

`import "fmt"` は、`fmt`(format の略)という標準ライブラリのパッケージを **取り込む** 宣言です。`fmt` には画面への出力機能が入っており、今回はこれを使います。使わないパッケージを import するとコンパイルエラーになる点も、Go らしい厳しさです。

`func main() { ... }` は **main 関数** の定義です。プログラムを実行すると、Go はこの `main` 関数を最初に呼び出します。つまりここがプログラムの開始地点です。

その中の `fmt.Println("Hello, World")` が、実際に文字列を画面へ 1 行表示する命令です。`Println` の `ln` は line(行)を意味し、出力の末尾で自動的に改行します。

## 実行する

ファイルを保存したら、そのフォルダでターミナルを開き、次を実行します。

```bash
go run hello.go
```

画面に `Hello, World` と表示されれば成功です。`go run` は、ビルドと実行をまとめて行ってくれる便利なコマンドで、書いてすぐ動作を確認したいときに重宝します。次のセクションでは、この `go run` と `go build` の違いを掘り下げます。

## まとめ

- `package main` / `import` / `func main` が最小プログラムの骨格です。
- `func main` が実行の開始地点で、`fmt.Println` が画面に出力します。
- `go run hello.go` で、書いたコードをすぐ実行できます。
