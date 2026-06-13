---
section_id: "02-02"
chapter_id: "02"
title: 定番フィルタ 6 選 — grep・sort・uniq・wc・head・tail
order: 2
estimated_minutes: 5
estimated_chars: 1252
learning_points:
  - grep・sort・uniq・wc・head・tail の役割を一言で説明できる
  - フィルタが「標準入力から受け取り、加工して標準出力へ出す」共通の形を持つことを理解する
  - uniq は隣り合う重複しかまとめないため、sort とセットで使うことを知る
tags: [linux, filter, grep, sort, uniq, wc, head, tail]
related_sections: ["02-01", "02-03"]
key_terms:
  - term: フィルタ
    definition: 標準入力からデータを受け取り、加工した結果を標準出力へ出すコマンドの総称。パイプの部品になる
  - term: sort
    definition: 入力の行を並べ替えるフィルタ。既定では文字順、-n で数値順、-r で逆順になる
  - term: uniq
    definition: 隣り合う重複行を 1 行にまとめるフィルタ。-c を付けると重複した回数も表示する
---

## このセクションで学ぶこと

- パイプの部品になる 6 つの定番フィルタの役割を一言ずつ押さえる
- フィルタに共通する「標準入力 → 加工 → 標準出力」という形を理解する
- `uniq` が `sort` とセットで使われる理由を知る

## フィルタという共通の形

パイプの右側に置くコマンドには共通点があります。**標準入力からデータを受け取り、加工した結果を標準出力へ出す**という形です。この形のコマンドを**フィルタ**と呼びます。入り口と出口の形が同じだから、どのフィルタ同士でも自由につなげられるのです。

まずは実務で最頻出の 6 つを、役割と一緒に押さえましょう。

| コマンド | 役割の一言 | よく使う形 |
| --- | --- | --- |
| `grep` | 一致する行だけ通す | `grep "error"` |
| `sort` | 行を並べ替える | `sort` / `sort -nr` |
| `uniq` | 隣り合う重複行をまとめる | `uniq -c` |
| `wc` | 行数・単語数・文字数を数える | `wc -l` |
| `head` | 先頭の n 行だけ通す | `head -5` |
| `tail` | 末尾の n 行だけ通す | `tail -5` |

## 具体例 — 小さなファイルで 6 つを試す

注文記録のつもりで、果物の名前が並んだ `orders.txt` を例にします。

```bash
cat orders.txt
# apple
# banana
# apple
# cherry
# banana
# apple
```

まず数える・切り出す系から。

```bash
wc -l orders.txt        # 6 orders.txt → 全部で 6 行(6 件の注文)
head -2 orders.txt      # apple, banana → 先頭 2 行
tail -2 orders.txt      # banana, apple → 末尾 2 行
```

次に並べ替えと重複まとめです。ここがこの章の山場です。

```bash
sort orders.txt          # apple apple apple banana banana cherry(行単位で整列)
sort orders.txt | uniq   # apple banana cherry(重複が消えて品目一覧に)
sort orders.txt | uniq -c
#   3 apple
#   2 banana
#   1 cherry
```

`uniq -c` は「重複が何回続いたか」を行頭に付けてくれます。つまり `sort | uniq -c` という 2 段パイプだけで、**集計表**が作れるのです。次のセクションでは、これを本物のログに適用します。

なお `tail` には `-f` というオプションがあり、`tail -f app.log` とするとファイルの末尾を表示し続け、追記をリアルタイムで映し出します。ログ監視の定番として覚えておくと実務で役立ちます。

## 注意点 — uniq は「隣しか見ない」

つまずきどころは `uniq` です。`uniq` がまとめるのは**隣り合った重複行だけ**で、離れた場所にある同じ行はまとめません。先ほどの `orders.txt` に `uniq` を直接かけると、`apple` が離れて並んでいるため重複が残ったままになります。

```bash
uniq orders.txt   # apple banana apple cherry banana apple(何も減らない)
```

だから「先に `sort` で同じ行を隣に集めてから `uniq`」が鉄則です。`sort | uniq` はワンセットの慣用句として覚えてください。また `wc -l` の数えるのは行数です。`wc` 単体だと行数・単語数・文字数の 3 つが並ぶので、行数だけ欲しいときは `-l` を忘れないようにしましょう。

## まとめ

- フィルタは「標準入力 → 加工 → 標準出力」という共通の形を持ち、だから自由につなげられる
- `grep`(通す)・`sort`(並べる)・`uniq`(まとめる)・`wc`(数える)・`head`/`tail`(先頭・末尾を切り出す)が定番 6 選
- `uniq` は隣り合う重複しか見ないので、`sort | uniq` をワンセットで使う。`uniq -c` で集計表になる
