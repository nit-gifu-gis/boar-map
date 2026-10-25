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

今回の統合先は`msArray/v3.0`。開始コミット`5b25956`から、次のローカル作業ブランチに分けて実装し、merge commitで統合した。既存の`main`/`develop`とリモートへのpush・配信は実行していない。

| 作業ブランチ | 担当 |
| --- | --- |
| `misc/next16-platform` | Next.js 16.4.3、React 19.3.1、TypeScript 5.9.3、Sentry 11.9.0、ESLint 10、依存lockfile |
| `misc/next16-react` | Recoilから独立Contextへの置換、認証・JWT・ログ・モーダル、単体・ブラウザ回帰テスト |
| `misc/next16-ui` | Link、Reactの型、Leafletの生成/破棄、フォーム下書きと画像の再読込、詳細画面の非同期ガード |
| `misc/next16-delivery` | Docker、GitHub Actions、開発・配信手順 |
| `misc/next16-verification` | Next.js生成型、テスト成果物のignore、統合検証の記録 |

| 対象 | 動作 |
| --- | --- |
| 作業ブランチ | ローカル検証とレビュー用。自動配信しない |
| `main`/`develop`宛てPR | Docker内でlint・型チェック・単体テスト・production buildを行い、起動したイメージの`/login`・`/map`・静的CSS・404を確認 |
| `develop` | 既存レジストリの`boar-map:develop`を更新し、Build-develop成功後に開発サーバーの既存更新エンドポイントを呼ぶ |
| `main` | 既存レジストリの`boar-map:main`と`:latest`を更新し、Build-prod成功後に本番サーバーの既存更新エンドポイントを呼ぶ |

配信用workflowの手動実行も対象ブランチに限定する。更新履歴の`[meta]`処理は維持し、対象ファイルだけを通常のpushで保存する。commitメッセージやsecretはシェルへ直接埋め込まず環境変数経由で渡す。

`SENTRY_AUTH_TOKEN`はBuildKitのsecret mountでビルドコマンドにだけ渡す。DockerのARG/ENVとrunnerからは除き、ローカル・PRビルドではsource mapを送信しない。環境名とrelease識別子は公開可能なbuild-argとして従来どおりCIで指定する。

Dockerビルド時・PRのHTTP確認・ブラウザテスト用サーバーは`SENTRY_DISABLED=1`でサーバー側の監視送信を止める。この非公開の環境変数はrunnerに設定せず、通常起動時の監視とCIのsource map uploadを維持する。ブラウザ側のSentry通信はテストfixtureが`/monitoring`と末尾slash付き経路の両方を遮断する。

## ローカルの確認コマンド

```bash
yarn install --frozen-lockfile
yarn lint
yarn typecheck
yarn test
yarn build
yarn start
```

ブラウザ回帰はproduction build後に実行する。開発時のStrict Mode再実行も同じ6ケースで確認する。詳細は[tests/browser/README.md](../tests/browser/README.md)を参照。

```bash
yarn playwright install chromium
yarn test:browser
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
| 依存再現性 | Windows / Node 24.22.1 / Yarn 1.22.22で`yarn install --frozen-lockfile --non-interactive`成功。lockfileの変更なし |
| lint | ESLint 10.13.0でエラー0、警告78。Compiler由来55、既存の未使用変数9、不要disable8、import順6 |
| typecheck | `next typegen && tsc --noEmit --incremental false`成功。dev実行後にdev/build両方のキャッシュが存在する状態でも再確認済み |
| 単体テスト | Node 24で5件成功。JWTのBase64URL/UTF-8・不正形式・期限境界、Strict Mode相当のconsole登録/解除を検証 |
| production build | Next.js 16.4.3 / React 19.3.1 / Webpackで成功。Pages Routerの37ページを生成（うち2ページがgetStaticProps） |
| production serverのHTTP確認 | `/login`・`/map`・`/version`・Leaflet CSS・PDF.js viewer・ローカル画像最適化が200、未知URLが404。計7件成功 |
| ブラウザ操作・モックAPIによる回帰 | Windows / Chromium 156でproduction 6件・development/Strict Mode 6件が全成功。認証3状態、地図のLink往復/resize、modal開閉/scroll解除、写真を含む下書き保持、画像画面自身のreload後の無効Blob除去。未処理例外・React/hydrationエラーなし。地図のスクリーンショットも目視確認 |
| Dockerイメージbuild / 起動 | ローカルDocker daemon未稼働のため未実施。CIで確認 |
| GitHub Actions / レジストリpush / 配信更新POST | ローカル作業では未実行。対象ブランチへ反映後に確認 |
| 実APIへのログイン・更新・アップロード | 未実施。接続権限と検証用データがある開発環境で確認 |
| 実Sentryでのイベント/source map到達確認 | 未実施。対応するCI secretと開発プロジェクトで確認 |

## 残る診断と保守事項

- React Compilerは有効化していない。新しい`immutability`・`refs`・`set-state-in-effect`診断は既存UIの段階的な改善対象として警告を維持し、Hooksの呼び出し規則などのエラー検出は継続する。既存の未使用変数・import順等にも警告が残る。
- Next同梱プラグインの一部はESLint 10をpeer dependencyにまだ列挙していない。`@eslint/compat@2.1.1`の公式shimで削除APIを補完し、実際のlint実行で検証する。peer警告を無理な依存上書きで隠していない。
- ブラウザ回帰中にNext.jsの`compression`/`httpxy`から`MaxListenersExceededWarning`が出る場合がある。アプリの未処理例外やテスト失敗は伴っていない。同じstackは[Next.js公式issue #97757](https://github.com/vercel/next.js/issues/97757)で報告され、[修正PR #97818](https://github.com/vercel/next.js/pull/97818)は調査時点で未マージ。発火したリクエストURLの特定までは行っておらず、listener上限の変更や圧縮無効化で警告を隠していない。
- lockfileに既存のBrowserslistデータの古さに関する通知が残る。対象端末の要件と実機確認は別途行う。
- 開発モードでは既存画像のアスペクト比指定とLCP読み込み方針に関するNext Imageの助言が残る。画像最適化のHTTP応答と主要画面の操作は確認済みだが、全画面・全端末の目視比較は未実施。
- Pages Routerの生成validatorがdev/build両方に存在するとグローバル型が重複したため、`moduleDetection: force`で通常のソースと生成ファイルをモジュールとして隔離した。既存のグローバル`.d.ts`宣言は維持し、生成validatorを削除したり型チェックから除外したりしていない。
- `next dev`が生成する`AGENTS.md`を含め、エージェント向け参照先をインストール済みNext.jsのドキュメントへ揃える。

## 参照

- [Next.js 16移行ガイド（Pages Router）](https://nextjs.org/docs/pages/guides/upgrading/version-16)
- [Node.jsリリース状況](https://nodejs.org/en/about/previous-releases)
- [Sentry Next.js SDKのセットアップ](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Docker BuildKit secretとGitHub Actions](https://docs.docker.com/build/ci/github-actions/secrets/)
