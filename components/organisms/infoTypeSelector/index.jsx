import "./infoTypeSelector.scss";
import Router from "next/router";
import React from "react";
import InfoTypeItem from "../../molecules/InfoTypeItem";
import AddInfoFooter from "../../molecules/addInfoFooter";

const BoarDiv = () => (
  <div className="boar_div">
    <input type="radio" id="radio1" name="infoType" value="boar" />
    <label htmlFor="radio1">
      <InfoTypeItem
        src="../static/images/icons/boar.svg"
        alt="いのししアイコン"
        text="捕獲いのしし"
      />
    </label>
  </div>
);

const TrapDiv = () => (
  <div className="trap_div">
    <input type="radio" id="radio2" name="infoType" value="trap" />
    <label htmlFor="radio2">
      <InfoTypeItem
        src="../static/images/icons/trap.svg"
        alt="わなアイコン"
        text="わな"
      />
    </label>
  </div>
);

const VaccineDiv = () => (
  <div className="vaccine_div">
    <input type="radio" id="radio3" name="infoType" value="vaccine" />
    <label htmlFor="radio3">
      <InfoTypeItem
        src="../static/images/icons/vaccine.svg"
        alt="ワクチンアイコン"
        text="ワクチン"
      />
    </label>
  </div>
);

class InfoTypeSelector extends React.Component {
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

    // 本番：ユーザーIDの１文字目からユーザーを識別
    // const userDepartment = userData.user_id.substr(0, 1).toUpperCase();
    // テスト環境：ユーザーIDから識別
    // どうして仕様に則ったユーザーIDじゃないの…
    let userDepartment;
    switch (userData.user_id) {
      case "tyousa":
        userDepartment = "T";
        break;
      case "yuugai":
        userDepartment = "U";
        break;
      case "shityouson":
        userDepartment = "S";
        break;
      case "trap":
        userDepartment = "W";
        break;
      case "pref":
        userDepartment = "K";
        break;
      default:
        userDepartment = null;
        break;
    }

    // userDepartmentに応じて表示するものを変更する
    switch (userDepartment) {
      case "T":
      case "U":
      case "S":
        this.choices = [<BoarDiv />, <TrapDiv />];
        break;
      case "W":
        this.choices = [<VaccineDiv />];
        break;
      case "K":
        this.choices = [<BoarDiv />, <TrapDiv />, <VaccineDiv />];
        break;
      default:
        this.choices = [];
        break;
    }
  }

  // 前へボタンを押したときの処理
  onClickPrev() {
    Router.push("/map");
  }

  // 次へボタンを押したときの処理
  onClickNext() {
    // チェックボックスを確認
    const infoTypes = document.getElementsByName("infoType");
    let checkedItem = "";
    infoTypes.forEach(i => {
      if (i.checked) {
        checkedItem = i.value;
      }
    });
    // チェックが入ってない
    if (!checkedItem) {
      window.alert("登録する情報の種類が選択されていません!!");
      return;
    }
    // チェックが有る場合
    const url = "/add/location";
    switch (checkedItem) {
      case "boar":
      case "vaccine":
        break;
      default:
        window.alert("工事中");
        return;
    }
    Router.push({ pathname: url, query: { type: checkedItem } }, url);
  }

  render() {
    return (
      <div className="infoTypeSelector">
        <div className="__Title">
          <h1>情報登録</h1>
        </div>
        <div className="__description">
          <p>登録する情報を選択し、次へボタンを押してください。</p>
        </div>
        <div className="__choices">
          <div className="radio">{this.choices}</div>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext}
        />
      </div>
    );
  }
}

export default InfoTypeSelector;
