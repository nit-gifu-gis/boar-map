# Next.js 16 Pages Router移行記録

## 方針と変更範囲

既存の`src/pages`、URL、画面構成、外部APIとの契約を維持してNext.js 16へ移行する。App Routerへの変更、Tailwind CSS 4への変更、Turbopackへの変更は今回の対象に含めない。

- Node.js 24.22.1 LTS、Yarn Classic 1.22.22、React 19、TypeScript 5を使用する。
- 開発・本番ともWebpackを明示し、Next.js本体の移行とbundlerの変更を分ける。
- React 19で動作する状態管理、イベント処理、型定義へ更新する。
- ESLintを直接呼び出し、型チェック・単体テスト・ビルドを独立して実行する。ビルド時にソースを自動修正しない。
- Next.js 16対応のSentry SDKとinstrumentation構成へ更新する。
- DockerはNode.js 24のDebian bookworm版に統一する。`next.config.mjs`をビルド・実行の両stageへ含める。

移行前のlockfileではNext.js 12.1.0、React 17.0.2、TypeScript 4.5.4、Recoil 0.6.1、Sentry 7.58.1が固定されていた。元のDockerfileはNode.js 16とDebian stretchを使用し、`next.config.mjs`をコピーしていなかった。今回コピーを修正するため、Docker環境でも設定どおりにSentryやReact Strict Modeが有効になることを確認する。

## 開発・配信経路

| 対象 | 動作 |
| --- | --- |
| 作業ブランチ | ローカル検証とレビュー用。自動配信しない |
| `main`/`develop`宛てPR | Docker内でlint・型チェック・単体テスト・production buildを行い、起動したイメージの`/login`・`/map`・静的CSS・404を確認 |
| `develop` | 既存レジストリの`boar-map:develop`を更新し、Build-develop成功後に開発サーバーの既存更新エンドポイントを呼ぶ |
| `main` | 既存レジストリの`boar-map:main`と`:latest`を更新し、Build-prod成功後に本番サーバーの既存更新エンドポイントを呼ぶ |

配信用workflowの手動実行も対象ブランチに限定する。更新履歴の`[meta]`処理は維持し、対象ファイルだけを通常のpushで保存する。commitメッセージやsecretはシェルへ直接埋め込まず環境変数経由で渡す。

`SENTRY_AUTH_TOKEN`はBuildKitのsecret mountでビルドコマンドにだけ渡す。DockerのARG/ENVとrunnerからは除き、ローカル・PRビルドでは送信しない。環境名とrelease識別子は公開可能なbuild-argとして従来どおりCIで指定する。

## ローカルの確認コマンド

```bash
yarn install --frozen-lockfile
yarn lint
yarn typecheck
yarn test
yarn build
yarn start
```

Dockerが利用可能な環境では以下も確認する。ローカルのDocker daemonは検証のために自動起動しない。

```bash
docker build --tag boar-map:next16 .
docker run --rm --publish 3000:3000 boar-map:next16
```

別ターミナルから`/login`、`/map`、`/static/leaflet.css`が200、存在しないURLが404になることを確認する。CIにも同じ起動確認を組み込む。

## 回帰確認

画面が200を返すだけでは操作の互換性は保証できない。ブラウザ内のJavaScript例外、hydrationの不一致、ネットワーク失敗も確認する。書き込みを含む項目は開発環境またはローカルのモックAPIで実施し、本番データを検証目的で変更しない。

| 機能 | 確認する操作・結果 |
| --- | --- |
| ログイン・セッション | 成功/失敗、ログアウト、再読み込み、セッション期限切れ、権限に応じたメニュー・設定表示 |
| ページ遷移 | トップ・一覧・詳細・地図・設定間の遷移、戻る/進む、URLの直接入力と再読み込み、query付きURL |
| 地図 | 初回表示、再訪、ズーム/移動、現在位置、マーカー・クラスタ、レイヤー・WMS、表示条件と地図設定の反映 |
| 登録・編集 | 各情報種別の場所・入力・画像・確認の各step、戻った際の値の維持、validation、二重送信防止、登録/更新/削除結果 |
| 写真 | 選択、プレビュー、EXIFや位置情報、向き、画像差替え、設定、ダウンロード |
| 一覧・検索・取込 | 検索条件、並べ替え、結果0件、詳細との整合、対応形式の取込、地図ダウンロード・ファイル出力 |
| 管理・通知 | 市町村、報告関係、ジビエ関係、通知、豚熱表示などの各設定と権限 |
| 文書・エラー | PDF表示、更新履歴、404、サーバーエラー、APIが失敗した場合の表示 |
| 状態・副作用 | ページ間でのユーザー情報の共有、ログ表示、地図の破棄と再生成、イベントの重複登録や多重通信がないこと |
| Sentry | 開発用イベントの到達、ユーザー/release/environment、サーバー・クライアント各例外、source map、`/monitoring`、Replayのマスキング |
| 端末 | PCとモバイルのレイアウト、Chrome/Edge/Firefox、Safari/iOS、現場端末のブラウザバージョン |

Next.js 16の対象ブラウザはChrome/Edge 111以上、Firefox 111以上、Safari 16.4以上。古いiOS端末等を利用している場合は、利用端末が要件を満たすか配信前に確認する。

## 検証記録

各項目には実行環境・結果・未検証の理由を追記する。`未実施`やモックでの成功を実APIでの確認済みとして扱わない。

| 項目 | 結果・実行環境 |
| --- | --- |
| Workflow構文 | Windows上で全5ファイルのYAML解析、bash -n、actionlint 1.7.12に合格。GitHub Actions自体は未実行 |
| lint / typecheck / 単体テスト / production build | 実装後に実測結果を追記 |
| production serverのHTTP確認 | 実装後に実測結果を追記 |
| ブラウザ操作・モックAPIによる回帰 | 実装後に実測結果と対象範囲を追記 |
| Dockerイメージbuild / 起動 | ローカルDocker daemon未稼働のため未実施。CIで確認 |
| GitHub Actions / レジストリpush / 配信更新POST | ローカル作業では未実行。対象ブランチへ反映後に確認 |
| 実APIへのログイン・更新・アップロード | 未実施。接続権限と検証用データがある開発環境で確認 |
| 実Sentryへのイベント/source map送信 | 未実施。対応するCI secretと開発プロジェクトで確認 |

## 参照

- [Next.js 16移行ガイド（Pages Router）](https://nextjs.org/docs/pages/guides/upgrading/version-16)
- [Node.jsリリース状況](https://nodejs.org/en/about/previous-releases)
- [Sentry Next.js SDKのセットアップ](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Docker BuildKit secretとGitHub Actions](https://docs.docker.com/build/ci/github-actions/secrets/)
