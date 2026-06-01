---
section_id: "03-02"
chapter_id: "03"
title: TypeScript ― JavaScript に型を足す
order: 2
estimated_minutes: 4
estimated_chars: 1416
learning_points:
  - TypeScript が JavaScript に「型」を後付けした言語であることを理解する
  - 型があることでミスを実行前に見つけられる利点を押さえる
  - TypeScript が最終的に JavaScript に変換されて動くことを知る
tags:
  - typescript
  - javascript
  - type-system
related_sections:
  - "03-01"
  - "03-04"
key_terms:
  - term: TypeScript
    definition: JavaScript に型の仕組みを加えた言語。書いたコードは最終的に JavaScript に変換されて動く。
  - term: 型
    definition: その値が数値なのか文字列なのかといった「データの種類」のこと。型を明示すると取り違えを防ぎやすい。
  - term: コンパイル
    definition: ここでは TypeScript を、ブラウザや Node.js が実行できる JavaScript へ変換する処理を指す。
---

## このセクションで学ぶこと

- TypeScript が JavaScript に「型」を後付けした言語であることを理解する
- 型があることでミスを実行前に見つけられる利点を押さえる
- TypeScript が最終的に JavaScript に変換されて動くことを知る

## JavaScript の弱点を補う「型」

前のセクションで、JavaScript は動的型で、型の取り違えに実行するまで気づきにくいという弱点を見ました。**TypeScript は、その JavaScript に「型」を後付けした言語**です。JavaScript の文法をほぼそのまま受け継ぎつつ、「この変数は数値」「この関数は文字列を返す」といった**型**の情報を書けるようにしたものだと考えてください。

たとえば、本来は数値を渡すべき関数に、うっかり文字列を渡してしまったとします。素の JavaScript ではプログラムを動かして初めておかしくなりますが、TypeScript なら**書いている途中で「型が合っていません」と指摘してくれます**。バグを実行前に、しかもエディタ上で見つけられるわけです。小さなプログラムでは差を感じにくいかもしれませんが、ファイルや関わる人が増えるほど、この事前チェックの恩恵は大きくなります。

## 最終的には JavaScript として動く

TypeScript で気をつけたいのは、**ブラウザや Node.js は TypeScript を直接実行できない**という点です。TypeScript で書いたコードは、実行する前に**コンパイル**(変換)というステップを通して JavaScript に直され、その JavaScript が動きます。

```
TypeScript のコード  →  コンパイル  →  JavaScript のコード  →  ブラウザ / Node.js が実行
```

つまり TypeScript は「JavaScript を書きやすく・安全にするための上乗せ」であり、土台はあくまで JavaScript です。型を書く手間や変換のひと手間が増える代わりに、安全性と読みやすさを得る、というトレードオフだと理解しておくとよいでしょう。

## どんなときに効いてくるか

注意したいのは、TypeScript の型は「あれば必ず安全」という万能の保証ではなく、**書いた範囲で取り違えを防いでくれる仕組み**だという点です。型をきちんと付けずに「とりあえず何でも入る」状態のまま書けば、せっかくの安全装置は働きません。逆に、関数の入り口と出口の型を丁寧に書いておくと、後から仕様を変えたときに「ここも直す必要がある」とエディタが芋づる式に教えてくれます。

実務では、一人で素早く試すだけの小さなコードなら素の JavaScript で十分なこともあります。一方、複数人で長く育てていく Web アプリでは、最初から TypeScript を選んでおくと、型が「コードの取扱説明書」のように働き、読み手の負担を減らしてくれます。前のセクションで見た JavaScript の手軽さに、Java のような型の堅さを少しだけ持ち込んだもの――そんな位置づけで覚えておくと、次のセクションで 3 言語を並べるときに整理しやすくなります。

## まとめ

- TypeScript は JavaScript に型を後付けし、型の取り違えを実行前に見つけられるようにした言語。
- ファイルや人が増える大きめの開発ほど、型による事前チェックの恩恵が大きい。
- TypeScript はコンパイルで JavaScript に変換されてから動く。土台は JavaScript のまま。
