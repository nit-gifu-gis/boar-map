# いのししマップぎふ v2
[![Build](https://github.com/nit-gifu-gis/boar-map/actions/workflows/build.yml/badge.svg)](https://github.com/nit-gifu-gis/boar-map/actions/workflows/build.yml)

## 使用言語/フレームワーク
※ Node.jsのバージョン固定のため、[Volta](https://docs.volta.sh/guide/getting-started)をインストールする必要があります。
- TypeScript
- Node.js 16.13
- Next.js v12
- Tailwindcss v3.0

## コマンド
```bash
# 依存関係インストール
$ yarn install

# パッケージの追加 (本番環境に必要なもの)
$ yarn add <パッケージ名>

# パッケージの追加 (開発環境に必要なもの)
$ yarn add <パッケージ名> --dev

# 開発用サーバー起動
$ yarn dev

# ビルド + サーバー起動
$ yarn build
$ yarn start
```

## 開発の流れ
[CONTRIBUTING.md](CONTRIBUTING.md) を参照

## デプロイ先 
1. https://boar-map.gifugis.jp/ (masterブランチ)
1. https://gis-dev.junki-t.net/ (developブランチ)
1. https://boar-map.nit-gifu-gis.vercel.app/ (その他ブランチ)

## 著作権表記
Copyright (c) 2019-2022 National Institute of Technology, Gifu College GIS Team
