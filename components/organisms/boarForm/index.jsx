import "./boarForm.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

class BoarForm extends React.Component {
  constructor() {
    super();
    // ユーザーデータ取得(cookieから持ってくる)
    const userData = { user_id: "", access_token: "" };
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(function(value) {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "user_id") {
          userData.user_id = content[1];
        } else if (content[0] == "access_token") {
          userData.access_token = content[1];
        }
      });
    } else {
      return;
    }
  }

  // 前へボタンを押したときの処理
  onClickPrev() {
    const url = "/add/location";
    Router.push({ pathname: url, query: { type: "boar" } }, url);
  }

  // 次へボタンを押したときの処理
  onClickNext() {
    window.alert("工事中！");
  }

  render() {
    return (
      <div className="boarForm">
        <div className="__title">
          <h1>捕獲いのしし情報</h1>
        </div>
        <div className="__description">
          <p>各情報を入力してください。</p>
        </div>
        <div className="__form">
          <p>
            位置情報確認：({Router.query.lat}, {Router.query.lng})
          </p>
          <p>工事中！</p>
          <p>工事中！！</p>
          <p>工事中！！！</p>
          <p>工事中！！！！</p>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext}
        />
      </div>
    );
  }
}

export default BoarForm;
