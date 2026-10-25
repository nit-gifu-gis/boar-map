ブラウザ回帰テストは production build を使用します。

```powershell
yarn build
yarn playwright install chromium
yarn test:browser
```

Strict Mode の開発時 Effect 再実行も確認する場合は、同じテストを開発サーバーで実行できます。

```powershell
$env:PLAYWRIGHT_DEV = '1'
yarn test:browser
Remove-Item Env:PLAYWRIGHT_DEV
```

各テストは新しいブラウザコンテキストで実行し、fixture が認証、設定、地物、メッシュ、地図タイルをローカルで返します。外部宛てリクエストは継続しません。Sentry の同一オリジン tunnel と外部画像への最適化リクエストも遮断し、Service Worker を無効にしています。

テスト用サーバーでは`SENTRY_DISABLED=1`でサーバー側のSentry送信も無効化します。通常起動時の監視と、CIのソースマップアップロードは維持します。

認証状態、Pages Router の画面遷移、地図再生成とリサイズ、独自モーダル、登録途中のブラウザ内データを確認します。実 API の認証・権限制御、実データの登録更新、実地図の内容、Sentry への送信は未検証です。
