# いのししマップぎふ

[![Build Check](https://github.com/nit-gifu-gis/boar-map/actions/workflows/check.yml/badge.svg)](https://github.com/nit-gifu-gis/boar-map/actions/workflows/check.yml)

## 開発環境

- Node.js 24.22.1 LTS / Yarn Classic 1.22.22
- Next.js 16 / Pages Router
- React 19 / TypeScript 5
- Tailwind CSS 3
- Webpack（開発・本番ビルドとも明示して使用）

[Volta](https://docs.volta.sh/guide/getting-started)を使うと、`package.json`に固定されたNode.jsとYarnのバージョンが選択されます。依存関係の正確なバージョンは`yarn.lock`を参照してください。

## 起動と検証

```bash
yarn install --frozen-lockfile
yarn dev
```

APIの接続先を変更する場合は、`.env.sample`を参考に`.env.local`を作り、`NEXT_PUBLIC_API_OVERRIDE`を設定してください。この値はブラウザに公開され、ビルド時に組み込まれます。秘密情報は設定しないでください。

```bash
# ソースを書き換えない検証
yarn lint
yarn typecheck
yarn test

# 本番ビルドと起動
yarn build
yarn start
```

`yarn lint:fix`と`yarn format`はファイルを変更するコマンドです。CIと`yarn build`は自動修正を実行しません。

## Docker

```bash
docker build --tag boar-map:local .
docker run --rm --publish 3000:3000 boar-map:local
```

Dockerビルドでもlint・型チェック・単体テスト・本番ビルドを実行します。`.env`類やローカルの`node_modules`はイメージに含みません。Node.js 24のDebian bookwormイメージを使い、実行時は`node`ユーザーで起動します。

Sentryへソースマップを送信するビルドでは、環境変数`SENTRY_AUTH_TOKEN`をBuildKitのsecretとして渡します。トークンをbuild-argや実行コンテナの環境変数に設定する必要はありません。

```bash
docker build --tag boar-map:local --secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN .
```

`NEXT_PUBLIC_SENTRY_ENVIRONMENT`と`NEXT_PUBLIC_SENTRY_RELEASE`は任意のbuild-argです。トークンを渡さないローカル・PRビルドではソースマップを送信しません。

## ブランチと配信先

| ブランチ | 用途 | 配信先 |
| --- | --- | --- |
| `main` | 本番 | https://boar-map.gifugis.jp/ |
| `develop` | 開発環境 | https://boarmap-dev.gifu-nct.ac.jp/ |
| 作業ブランチ | 実装・PRレビュー | 自動配信なし |

`main`/`develop`へのpushはDockerの検証とレジストリへのpushを行い、成功後に既存サーバーの更新処理を呼び出します。Pull RequestではDockerイメージの検証とHTTPによる起動確認を行います。手動実行でも、配信用workflowは対応するブランチでのみ動作します。

開発の進め方は[CONTRIBUTING.md](CONTRIBUTING.md)、移行の変更点・検証状況・回帰確認手順は[Next.js 16移行記録](docs/next16-migration.md)を参照してください。

## 著作権表記

Copyright (c) 2019-2026 National Institute of Technology, Gifu College GIS Team
