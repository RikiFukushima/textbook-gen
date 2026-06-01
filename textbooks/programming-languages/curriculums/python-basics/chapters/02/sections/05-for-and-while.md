---
section_id: "02-05"
chapter_id: "02"
title: for と while による繰り返し
order: 5
estimated_minutes: 5
estimated_chars: 928
learning_points:
  - for で要素やリスト・辞書を順番に処理できる
  - while で条件が成り立つ間だけ繰り返せる
  - break / continue で繰り返しの流れを制御できる
tags: [python, for, while, ループ, 制御構文]
related_sections: ["02-02", "02-03", "02-04"]
key_terms:
  - term: for 文
    definition: リストや文字列などの要素を 1 つずつ取り出して、要素の数だけ処理を繰り返す制御構文。
  - term: while 文
    definition: 指定した条件が True である間、処理を繰り返し続ける制御構文。
  - term: break
    definition: 繰り返しの途中でループ全体を打ち切るための文。条件を満たしたら抜ける用途に使う。
---

## このセクションで学ぶこと

- `for` で要素やリスト・辞書を順番に処理できる
- `while` で条件が成り立つ間だけ繰り返せる
- `break` / `continue` で繰り返しの流れを制御できる

## for 文 ― 要素を 1 つずつ処理する

同じような処理を何度も繰り返したいとき、コードをコピーするのではなく **ループ** で書きます。Python で最もよく使うのが `for` 文です。リストや文字列などから要素を 1 つずつ取り出し、要素の数だけ処理を繰り返します。

```python
fruits = ["りんご", "みかん", "ぶどう"]
for fruit in fruits:
    print(fruit)        # りんご / みかん / ぶどう を順に表示
```

`for 変数 in 対象:` と書き、`if` 文と同じく行末にコロン `:` を付け、繰り返したい処理をインデントします。1 周ごとに `fruit` へ次の要素が入ります。決まった回数だけ繰り返したいときは `range()` を使います。`range(3)` は `0, 1, 2` を順に生み出します。

```python
for i in range(3):
    print(i)            # 0 / 1 / 2

user = {"name": "田中", "age": 30}
for key, value in user.items():
    print(key, value)   # 辞書もキーと値で走査できる
```

辞書を `items()` で回せば、キーと値をまとめて取り出せます(02-03 で扱った走査と同じ書き方です)。

## while 文 ― 条件が続く間くり返す

繰り返す回数があらかじめ決まっておらず、「ある条件が成り立つ間だけ続けたい」場合は `while` 文を使います。条件が `True` の間、処理を繰り返します。

```python
count = 0
while count < 3:
    print(count)        # 0 / 1 / 2
    count = count + 1   # 条件を進める更新を必ず入れる
```

注意点は、ループの中で **条件がいつか `False` になる更新を必ず入れる** ことです。上の例で `count` を増やし忘れると、条件が永遠に `True` のままになり、プログラムが止まらない **無限ループ** になります。

## break と continue で流れを変える

ループの途中で抜けたいときは `break`、その周だけ飛ばして次へ進みたいときは `continue` を使います。

```python
for n in [3, 7, 0, 5]:
    if n == 0:
        break           # 0 を見つけたらループを終了
    print(10 // n)      # 3 / 1 を表示して終わる

for n in range(5):
    if n % 2 == 0:
        continue        # 偶数はスキップ
    print(n)            # 1 / 3 を表示
```

`break` は「探し物が見つかったら打ち切る」、`continue` は「条件に合わない要素を飛ばす」といった使い分けになります。

## まとめ

- `for` はリストや `range()` の要素を 1 つずつ取り出して、その数だけ処理を繰り返す。
- `while` は条件が `True` の間くり返す。条件を進める更新を忘れると無限ループになる。
- `break` でループを打ち切り、`continue` でその周だけ飛ばして次へ進める。
</content>
</invoke>
