# いのししマップぎふ

## 使用するフレームーワーク
- Next.js ([参考](https://qiita.com/tsuuuuu_san/items/790ee15ed435b9860f57))
- SCSS ([参考](https://dev.classmethod.jp/slide/scss-tutorial/))

基本的に[Atomic Design](https://bit.ly/2QqaTKl)に基づいて作成しましょう

## コマンド等
```
初期設定
$ yarn

パッケージの追加
$ yarn add <パッケージ名>

デバッグ用
$ npm run dev
```

## ブランチの切り方
基本的に機能を作る前にissueを立ててから作業する

feature/issue番号
- 新機能実装時

bug/issue番号
- バグ修正時

## コミットメッセージ
- コミットメッセージには日本語を用いる
- 作業内容がぱっと見てわかるように簡潔に書く
- コミットメッセージのどこかにissue番号を書く

ex) `メイン画面の実装 #1`

## 開発の流れ
1. IssueのAsigneesに自分を追加する(誰がどの作業をしているかわかるようにするため)
2. 新しいブランチを切る
3. 作業をする
4. プルリクを作成する 

## アップデートログの更新方法(masterブランチのみ対応)
マージ時のコメントに次の形式のデータを含める。
```
[meta]
[version]Version x.x.x[/version]
[contents]
内容1
内容2
[/contents]
[/meta]
```

## デプロイ先
1. https://boar-map.nit-gifu-gis.now.sh/
2. https://app-gis-dev.junki-t.net/

## その他
- [homebrewのインストール方法](https://brew.sh/)
- [yarnのインストール方法](https://yarnpkg.com/lang/ja/docs/install/#mac-stable)

## 著作権表記
Copyright (c) 2019 National Institute of Technology, Gifu College GIS Team
