import "./infoTypeSelector.scss";
import Router from "next/router";
import React from "react";
import InfoTypeItem from "../../molecules/InfoTypeItem";
import AddInfoFooter from "../../molecules/addInfoFooter";

const BoarDiv = () => (
  <div className="boar_div">
    <input type="radio" name="infoType" value="boar" />
    <InfoTypeItem
      src="../static/images/icons/boar.svg"
      alt="いのししアイコン"
      text="捕獲いのしし"
    />
  </div>
);

const TrapDiv = () => (
  <div className="trap_div">
    <input type="radio" name="infoType" value="trap" />
    <InfoTypeItem
      src="../static/images/icons/trap.svg"
      alt="わなアイコン"
      text="わな"
    />
  </div>
);

const VaccineDiv = () => (
  <div className="vaccine_div">
    <input type="radio" name="infoType" value="vaccine" />
    <InfoTypeItem
      src="../static/images/icons/vaccine.svg"
      alt="ワクチンアイコン"
      text="ワクチン"
    />
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

  render() {
    return (
      <div className="infoTypeSelector">
        <div className="radio">{this.choices}</div>
        <AddInfoFooter prevLink={"/map"} nextLink={"/add/select"} />
      </div>
    );
  }
}

export default InfoTypeSelector;
