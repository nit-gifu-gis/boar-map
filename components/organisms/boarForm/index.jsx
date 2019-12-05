import "./boarForm.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

const TrapSelector = () => (
  <div className="trap_selector">
    <label>わなの種類</label>
    <select name="trap" id="trap">
      <option value="箱わな">箱わな</option>
      <option value="くくりわな">くくりわな</option>
      <option value="その他">その他</option>
    </select>
  </div>
);

const EnvSelector = () => (
  <div className="env_selector">
    <label>発見場所</label>
    <select name="env" id="env">
      <option value="山際">山際</option>
      <option value="山地">山地</option>
      <option value="その他">その他</option>
    </select>
  </div>
);

class BoarForm extends React.Component {
  state = {
    todayStr: "",
    trapOrEnvSelector: <TrapSelector />
  };

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
    this.state.todayStr = this.getTodayStr();
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

  // 今日の日付を取得する
  getTodayStr() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = ("0" + (date.getMonth() + 1)).slice(-2);
    const dd = ("0" + date.getDate()).slice(-2);
    return yyyy + "-" + mm + "-" + dd;
  }

  // 区分が変更されたときに呼ばれる
  onChangeDivision() {
    const divisonSelect = document.forms.form.division;
    const division = divisonSelect.options[divisonSelect.selectedIndex].value;
    switch (division) {
      case "死亡":
        this.setState(_ => {
          return { trapOrEnvSelector: <EnvSelector /> };
        });
        // this.state.trapOrEnvSelector = <EnvSelector />;
        break;
      default:
        this.setState(_ => {
          return { trapOrEnvSelector: <TrapSelector /> };
        });
        break;
    }
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
          <form name="form">
            <div className="__division">
              <label>区分</label>
              <select
                name="division"
                id="division"
                onChange={this.onChangeDivision.bind(this)}
              >
                <option value="調査捕獲">調査捕獲</option>
                <option value="有害捕獲">有害捕獲</option>
                <option value="死亡">死亡</option>
              </select>
            </div>
            <div className="__date">
              <label>捕獲年月日</label>
              <input
                type="date"
                name="date"
                id="date"
                value={this.state.todayStr}
              />
            </div>
            <div className="__trap_or_env">{this.state.trapOrEnvSelector}</div>
            <div className="__sex">
              <label>性別</label>
              <select name="sex" id="sex">
                <option value="オス">オス</option>
                <option value="メス">メス</option>
                <option value="不明">不明</option>
              </select>
            </div>
            <div className="__length">
              <label>体長(cm)</label>
              <input type="number" step="0.01"></input>
            </div>
            {/* 体重は体長から計算して送信する（表示しない） */}
          </form>
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
