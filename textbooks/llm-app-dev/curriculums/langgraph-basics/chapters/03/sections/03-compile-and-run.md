---
section_id: "03-03"
chapter_id: "03"
title: compileして実行する(invoke / stream)
order: 3
estimated_minutes: 6
estimated_chars: 818
learning_points:
  - compile でグラフを実行可能なオブジェクトに変換する
  - invoke で最終状態をまとめて受け取る
  - stream で中間状態を逐次観測する
tags:
  - langgraph
  - compile
  - invoke
  - stream
related_sections:
  - "03-01"
  - "03-02"
key_terms:
  - term: compile
    definition: 登録済みのノード・エッジ・入口・出口から実行可能なグラフオブジェクトを生成するメソッド。
  - term: invoke
    definition: グラフを最後まで実行し、最終的な State をまとめて 1 つ返す実行方法。
  - term: stream
    definition: ノードが実行されるたびに途中の更新を逐次返す実行方法。中間状態の観測に使う。
---

## このセクションで学ぶこと

- `compile` でグラフを実行可能なオブジェクトに変換する
- `invoke` で最終状態をまとめて受け取る
- `stream` で中間状態を逐次観測する

## まず compile する

これまで `builder`(`StateGraph`)にノードとエッジ、入口と出口を登録してきました。これは設計図にすぎません。実行するには `compile()` を呼んで、実行可能なグラフオブジェクトへ変換します。compile の時点で、入口の有無やエッジの接続先などの整合性が検証されます。

```python
graph = builder.compile()
```

返ってきた `graph` は、入力 State を渡すと設計図どおりにノードをたどって実行してくれるオブジェクトです。

## invoke と stream の使い分け

実行方法は主に 2 つあります。`invoke` は最初から `END` まで一気に走らせ、最終的な State だけを返します。結果さえ分かればよい本番処理に向きます。

```python
result = graph.invoke({"question": "LangGraphとは?"})
print(result["answer"])
```

`stream` はノードが 1 つ実行されるたびに、その更新を逐次返します。どのノードを通ったか、途中で State がどう変わったかを観測でき、デバッグや進捗表示に向きます。

```python
for chunk in graph.stream({"question": "LangGraphとは?"}):
    print(chunk)  # {ノード名: そのノードの更新} が順に流れてくる
```

両者の違いは「結果を 1 回で受け取るか、途中経過を流しながら受け取るか」です。返る最終状態は同じで、観測の粒度だけが異なります。

## 注意点

`compile()` は設計を変えるたびに呼び直す必要があります。`add_node` などを追加してから再 compile せずに古い `graph` を使うと、変更が反映されません。また `stream` が返すのは「各ステップでの更新分」であり、毎回の全 State ではない点に注意してください(モードによって挙動は変えられます)。

## まとめ

- `builder.compile()` で設計図を実行可能なグラフへ変換する。
- `invoke` は最終状態をまとめて、`stream` は中間状態を逐次返す。
- 設計を変えたら再 compile が必要。
