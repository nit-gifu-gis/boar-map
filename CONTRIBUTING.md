# Contribution guide

基本的には下記の方針に従って開発していきます。

## ブランチ命名則

- issueがあるもの → issue#(issue番号)
  - ex) issue#15
- issueがないもの
  - 機能追加 →　feature/(作業内容)
    - ex) feature/login_form
  - バグ修正 → bugfix/(作業内容)
    - ex) bugfix/edit_button_fix
  - 機能改善 → improve/(作業内容)
    - ex) improve/form_style
  - その他 → misc/(作業内容)
    - ex) misc/format_code

## コミットメッセージ

- コミットメッセージには日本語 or 英語を用いる
- 作業内容がパット見てわかるようにする
- issueと連動している場合はメッセージのどこかにissue番号を書く
- 作業中のコードをコミットする場合は「WIP:」を付けるなど、わかりやすいようにする

ex) `ログイン画面の実装 #1`

## 開発の流れ

1. (issueがある場合) IssueのAsigneesに自分を割り当てる
1. 上記命名則に従って新しいブランチを作成する
1. 作業をする
1. 上記コミットメッセージのルールに従ってコミットする
1. Pull Requestを作成する (基本的にはdevelopなど開発用のブランチに)
