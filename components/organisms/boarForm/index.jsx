import "./boarForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";
import TextInput from "../../atomos/textInput";
import InfoInput from "../../molecules/infoInput";

const TrapSelector = () => (
  <InfoInput title="わなの種類" type="number" name="trap" />
  // <div className="trap-selector form-parts">
  //   <label>わなの種類</label>
  //   <p></p>
  //   <select name="trap" id="trap">
  //     <option value="箱わな">箱わな</option>
  //     <option value="くくりわな">くくりわな</option>
  //     <option value="その他">その他</option>
  //   </select>
  // </div>
);

const EnvSelector = () => (
  <InfoInput title="発見場所" type="number" name="env" />
  // <div className="env-selector form-parts">
  //   <label>発見場所</label>
  //   <select name="env" id="env">
  //     <option value="山際">山際</option>
  //     <option value="山地">山地</option>
  //     <option value="その他">その他</option>
  //   </select>
  // </div>
);

class BoarForm extends React.Component {
  state = {
    trapOrEnvSelector: <TrapSelector />,
    lat: null,
    lng: null
  };

  componentDidMount() {
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({ lat: Router.query.lat, lng: Router.query.lng });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
  }

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
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    // 1 区分
    const division = form.division.options[form.division.selectedIndex].value;
    // 2 捕獲年月日
    const date = form.date.value;
    // 3 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 4 わなor発見場所
    let trapOrEnv;
    switch (division) {
      case "死亡":
        trapOrEnv = form.env.options[form.env.selectedIndex].value;
        break;
      default:
        trapOrEnv = form.trap.options[form.trap.selectedIndex].value;
        break;
    }
    // 5 性別
    const sex = form.sex.options[form.sex.selectedIndex].value;
    // 6 体長
    const length = form.length.value;
    // 7 体重
    const weight = this.weigh(Number(length));
    // 8 歯列画像
    // 9 現地写真
    // 確認画面に遷移
    const url = "/add/confirm/boar";
    Router.push(
      {
        pathname: url,
        query: {
          division: division,
          date: date,
          lat: lat,
          lng: lng,
          trapOrEnv: trapOrEnv,
          sex: sex,
          length: length,
          weight: weight
        }
      },
      url
    );
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

  // 体長を体重に変換する
  weigh(length) {
    if (length < 35) {
      return 5;
    } else if (length < 55) {
      return 10;
    } else if (length < 91) {
      return 20; // 幼獣
    } else if (length < 95) {
      return 20; // 成獣
    } else if (length < 105) {
      return 30;
    } else if (length < 115) {
      return 45;
    } else if (length < 125) {
      return 60;
    } else if (length < 135) {
      return 80;
    } else if (length < 145) {
      return 100;
    } else {
      return 130;
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    if (this.state.lat != undefined && this.state.lng != undefined) {
      return (
        <div className="boar-form">
          <div className="description">
            <p>各情報を入力してください。</p>
          </div>
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput title="区分" type="number" name="division" />
              {/* <div className="division form-parts">
                <label>区分</label>
                <p></p>
                <select
                  name="division"
                  id="division"
                  onChange={this.onChangeDivision.bind(this)}
                >
                  <option value="調査捕獲">調査捕獲</option>
                  <option value="有害捕獲">有害捕獲</option>
                  <option value="死亡">死亡</option>
                </select>
              </div> */}
              <InfoInput title="捕獲年月日" type="date" name="date" />
              {/* <div className="date form-parts">
                <label>捕獲年月日</label>
                <p></p>
                <input
                type="date"
                name="date"
                id="date"
                // value={this.state.todayStr}
              />
                <DateInput name="date" id="date" />
              </div> */}
              {this.state.trapOrEnvSelector}
              <InfoInput title="性別" type="number" name="sex" />
              {/* <div className="sex form-parts">
                <label>性別</label>
                <p></p>
                <select name="sex" id="sex">
                  <option value="オス">オス</option>
                  <option value="メス">メス</option>
                  <option value="不明">不明</option>
                </select>
              </div> */}
              <InfoInput title="体長 (cm)" type="number" name="length" />
              {/* <div className="length form-parts">
                <label>体長 (cm)</label>
                <div className="input-area">
                  <TextInput
                    type="number"
                    name="length"
                    placeholder="数字で入力"
                    required={true}
                  />
                </div>
              </div> */}
              {/* 体重は体長から計算して送信する（表示しない） */}
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="boar-form">
          <h1>情報取得中...</h1>
        </div>
      );
    }
  }
}

export default BoarForm;
