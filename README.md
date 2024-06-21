# いのししマップぎふ v3

[![Build](https://github.com/nit-gifu-gis/boar-map/actions/workflows/build.yml/badge.svg)](https://github.com/nit-gifu-gis/boar-map/actions/workflows/build.yml)

## 使用言語/フレームワーク

※ Node.jsのバージョン固定のため、[Volta](https://docs.volta.sh/guide/getting-started)を使用しています。

- TypeScript
- Node.js v20.15
- Yarn v4
- Next.js v14
- Tailwindcss v3.4.1

## コマンド

```bash
# 依存関係インストール
$ yarn install

# パッケージの追加 (本番環境に必要なもの)
$ yarn add <パッケージ名>

# パッケージの追加 (開発環境に必要なもの)
$ yarn add -D <パッケージ名>

# 開発用サーバー起動
$ yarn dev

# ビルド + サーバー起動
$ yarn build
$ yarn start
```

## 開発の流れ

[CONTRIBUTING.md](CONTRIBUTING.md) を参照

## デプロイ先

このブランチは開発中のため、下記URLに自動的にデプロイされるようになっています (準備中)

https://bm-v3-stg.db0.jp/

(下記は通常時のデプロイ先)

1. https://boar-map.gifugis.jp/ (masterブランチ)
1. https://boarmap-dev.gifu-nct.ac.jp/ (developブランチ)

## 著作権表記

Copyright (c) 2019-2024 National Institute of Technology, Gifu College GIS Team
