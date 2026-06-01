---
section_id: "05-04"
chapter_id: "05"
title: requirements.txt で環境を再現する
order: 4
estimated_minutes: 4
estimated_chars: 1109
learning_points:
  - requirements.txt の役割を理解する
  - pip freeze で依存を書き出せる
  - pip install -r で環境を再現できる
tags:
  - requirements
  - 依存管理
  - 再現性
related_sections:
  - "05-02"
  - "05-03"
key_terms:
  - term: requirements.txt
    definition: プロジェクトに必要なパッケージとバージョンを一覧で記録するテキストファイル。
  - term: pip freeze
    definition: 現在の環境に入っているパッケージとバージョンを requirements 形式で出力する pip のコマンド。
---

## このセクションで学ぶこと

- requirements.txt の役割を理解する
- `pip freeze` で依存を書き出せる
- `pip install -r` で環境を再現できる

## 必要なパッケージを「リスト」にして共有する

前のセクションで、仮想環境フォルダ `.venv` 自体は共有しないと学びました。では、別の人(あるいは別のマシンの自分)が同じ環境を作るにはどうすればよいでしょうか。答えは、必要なパッケージの一覧をテキストで記録して渡すことです。この一覧ファイルが **requirements.txt** です。

requirements.txt は次のような、1 行 1 パッケージのシンプルな形式です。

```text
requests==2.31.0
pandas==2.1.0
flask==3.0.0
```

`==` でバージョンまで固定しておくことで、誰が再現しても同じバージョンが入り、「自分の環境では動いたのに」という食い違いを防げます。これを **再現性** といい、チーム開発でとても重要です。

## pip freeze で書き出す

今の仮想環境に入っているパッケージから requirements.txt を自動生成するには、`pip freeze` を使います。出力をファイルにリダイレクトします。

```bash
pip freeze > requirements.txt
```

`pip freeze` は現在の環境のパッケージとバージョンを requirements 形式で出力するコマンドです。`>` でその出力を `requirements.txt` に保存しています。これで今の環境の状態がそのままファイルに記録されます。

## pip install -r で再現する

受け取った側は、自分の仮想環境を作って有効化したあと、次のコマンドで一括導入します。

```bash
pip install -r requirements.txt
```

`-r` は「このファイルに書かれたものをまとめて入れる」という指定です。これでファイルに記録されたパッケージとバージョンが、そのとおりに再現されます。

## 注意点:仮想環境を有効化してから実行する

`pip freeze` も `pip install -r` も、対象は「今アクティブな環境」です。仮想環境を有効化しないまま実行すると、システム全体のパッケージを書き出してしまったり、意図しない場所に入れてしまったりします。コマンドの前にプロンプトへ `(.venv)` が表示されているかを必ず確認しましょう。requirements.txt は `.venv` と違い、Git で共有する対象です。

## まとめ

- requirements.txt は必要パッケージとバージョンを記録し、環境の再現性を保つ。
- `pip freeze > requirements.txt` で書き出し、`pip install -r requirements.txt` で再現する。
- 実行前に仮想環境が有効か確認し、ファイル自体は Git で共有する。
