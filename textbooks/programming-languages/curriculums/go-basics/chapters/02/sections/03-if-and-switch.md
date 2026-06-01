---
section_id: "02-03"
chapter_id: "02"
title: if と switch による分岐
order: 3
estimated_minutes: 5
estimated_chars: 1800
learning_points:
  - if による条件分岐の書き方(丸括弧なし・波括弧必須)
  - if の初期化文でスコープを限定する書き方
  - switch を使った見通しのよい多分岐
tags:
  - go
  - control-flow
  - if
  - switch
related_sections:
  - "02-02"
  - "02-04"
key_terms:
  - term: if 文
    definition: 条件が真のときだけブロックを実行する分岐構文。Go では条件に丸括弧を付けず、波括弧は省略できない
  - term: 初期化文付き if
    definition: if 条件の前に「変数の宣言; 条件」と書く形式。宣言した変数はその if/else の中だけで有効になる
  - term: switch 文
    definition: 1 つの値や条件に応じて複数の分岐をまとめて書く構文。Go では各 case の最後で自動的に処理を抜ける
  - term: フォールスルー
    definition: ある case の処理が終わった後、次の case へ続けて流れること。Go では既定で起きず、fallthrough で明示する
---

# if と switch による分岐

## このセクションで学ぶこと

- if による条件分岐の書き方(丸括弧なし・波括弧必須)
- if の初期化文でスコープを限定する書き方
- switch を使った見通しのよい多分岐

## if は丸括弧なし・波括弧必須

条件によって処理を分けるのが **if 文** です。他の言語を知っている人がまず戸惑うのは、Go では条件に **丸括弧を付けない** こと、そして **波括弧を省略できない** ことです。

```go
score := 80
if score >= 60 {
    fmt.Println("合格")
} else {
    fmt.Println("不合格")
}
```

条件を `()` で囲まないのは Go の文法スタイルで、囲むと逆に冗長と見なされます。一方、1 行であっても `{}` は必ず必要です。これにより「波括弧の付け忘れによるバグ」が構造的に起きません。`else if` で条件を続けることもできます。

## 初期化文でスコープを絞る

Go の if には、条件の前に **初期化文** を書ける便利な形があります。`if 初期化; 条件 {` のように、セミコロンで区切って書きます。

```go
if n, err := strconv.Atoi("42"); err == nil {
    fmt.Println("変換成功:", n)
} else {
    fmt.Println("変換失敗:", err)
}
// ここでは n も err も使えない
```

ここで宣言した `n` と `err` は、その if と対応する else の **中だけ** で有効です。チェックのためだけに使う一時変数を、外側のスコープに漏らさずに済みます。エラーチェックのように「値を取り出して、すぐにその場で判定する」場面で特によく使われる書き方です。

## switch で多分岐を整理する

条件が増えて `else if` が続くと読みにくくなります。そんなときは **switch 文** が向いています。

```go
switch grade {
case "A":
    fmt.Println("優")
case "B":
    fmt.Println("良")
default:
    fmt.Println("その他")
}
```

Go の switch は、他言語と違って **各 case の最後で自動的に処理を抜けます**。`break` を書く必要はありません。うっかり break を忘れて次の case に流れ込む(**フォールスルー**)バグが起きないようになっています。意図的に次の case へ続けたいときだけ `fallthrough` を明示します。

case には複数の値をカンマで並べられ、値を省略すれば if-else チェーンのように条件式を書く switch も作れます。

```go
switch {
case score >= 80:
    fmt.Println("優秀")
case score >= 60:
    fmt.Println("合格")
default:
    fmt.Println("不合格")
}
```

`switch {` のように条件を省略すると、上から順に最初に真になった case が実行されます。長い `else if` の連鎖より、こちらのほうがずっと読みやすくなります。

## 注意点

if の条件には、必ず **bool 型の式** を書きます。C 言語のように「0 以外なら真」とはならず、`if count {` のような数値を直接渡す書き方はコンパイルエラーです。`if count > 0 {` のように、明確に真偽値になる式を書きましょう。曖昧な条件判定を許さないことで、意図がコードにそのまま表れます。

## まとめ

- if は条件に丸括弧を付けず、波括弧は省略できない。条件は bool 型の式に限る。
- `if 初期化; 条件` で一時変数のスコープをその分岐内に閉じ込められる。
- switch は case ごとに自動で抜け、多分岐や範囲判定を見通しよく書ける。
