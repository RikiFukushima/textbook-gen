---
section_id: "05-02"
chapter_id: "05"
title: pip でパッケージを導入する
order: 2
estimated_minutes: 5
estimated_chars: 888
learning_points:
  - pip が外部ライブラリを管理するツールだと理解する
  - pip install でパッケージを導入できる
  - pip list / show / uninstall で確認・削除ができる
tags:
  - pip
  - パッケージ
  - インストール
related_sections:
  - "05-01"
  - "05-03"
key_terms:
  - term: pip
    definition: Python の標準的なパッケージ管理ツール。PyPI からパッケージを導入・更新・削除する。
  - term: パッケージ
    definition: 配布の単位としてまとめられた外部ライブラリ。pip で導入する対象。
---

## このセクションで学ぶこと

- pip が外部ライブラリを管理するツールだと理解する
- `pip install` でパッケージを導入できる
- `pip list` / `show` / `uninstall` で確認・削除ができる

## pip は外部ライブラリの管理係

外部ライブラリを PyPI から取ってきて自分の環境に入れる作業を担うのが **pip** です。pip は Python に付属する標準的な **パッケージ** 管理ツールで、導入・更新・削除をコマンド一つで行えます。pip のコマンドは Python のコード内ではなく、ターミナル(コマンドプロンプト)で実行します。

まず pip が使えるか確認しましょう。

```bash
pip --version
```

バージョンが表示されれば準備完了です。表示されない場合は `python -m pip --version` を試します。`python -m pip` の形は、どの Python に紐づく pip かが明確になるため、実務でも安全な書き方として推奨されます。

## install でパッケージを導入する

パッケージを入れるには `pip install` にパッケージ名を渡します。

```bash
pip install requests
```

これで PyPI から `requests` がダウンロードされ、`import requests` が使えるようになります。バージョンを指定したいときは `==` でつなぎます。

```bash
pip install requests==2.31.0   # バージョン固定
pip install --upgrade requests # 最新へ更新
```

## 確認と削除のコマンド

導入済みのパッケージは次のコマンドで管理します。

```bash
pip list              # 入っているパッケージ一覧
pip show requests     # requests の詳細(バージョン・依存)
pip uninstall requests # アンインストール
```

`pip list` は今の環境に何が入っているかの一覧、`pip show` は個別パッケージの情報を表示します。

## 注意点:どこに入るのかを意識する

pip install はデフォルトで、その時点で使っている Python 環境全体にパッケージを入れます。プロジェクトごとに必要なライブラリが違う場合、すべてを一つの環境に入れるとバージョンの衝突が起きがちです。これを防ぐのが次のセクションの仮想環境です。

## まとめ

- pip はターミナルで実行する外部ライブラリの管理ツール。
- `pip install パッケージ名` で導入、`==` でバージョン指定できる。
- `pip list` / `show` / `uninstall` で確認・削除する。
