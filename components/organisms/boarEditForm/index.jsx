import "./boarEditForm.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";

const TrapSelector = props => (
  <div className="trap_selector">
    <label>わなの種類</label>
    <p></p>
    <select
      name="trap"
      id="trap"
      defaultValue={props["detail"]["properties"]["罠・発見場所"]}
    >
      <option value="箱わな">箱わな</option>
      <option value="くくりわな">くくりわな</option>
      <option value="その他">その他</option>
    </select>
  </div>
);

const EnvSelector = props => (
  <div className="env_selector">
    <label>発見場所</label>
    <p></p>
    <select
      name="env"
      id="env"
      defaultValue={props["detail"]["properties"]["罠・発見場所"]}
    >
      <option value="山際">山際</option>
      <option value="山地">山地</option>
      <option value="その他">その他</option>
    </select>
  </div>
);

class BoarEditForm extends React.Component {
  state = {
    trapOrEnvSelector: undefined
  };

  constructor() {
    super();
    /*
    trap Or Envを変える
    */
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
    const url = "/detail";
    Router.push(
      {
        pathname: url,
        query: { type: 0, FeatureID: this.props.detail["properties"]["ID$"] }
      },
      url
    );
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
    const lat = this.props.detail["geometry"]["coordinates"][1];
    const lng = this.props.detail["geometry"]["coordinates"][0];
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
    const url = "/edit/confirm/boar";
    Router.push(
      {
        pathname: url,
        query: {
          type: 0,
          id: this.props.detail["properties"]["ID$"],
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
        this.setState({
          trapOrEnvSelector: <EnvSelector detail={this.props.detail} />
        });
        // this.state.trapOrEnvSelector = <EnvSelector />;
        break;
      default:
        this.setState({
          trapOrEnvSelector: <TrapSelector detail={this.props.detail} />
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
    console.log(this.props.detail);
    if (!this.state.notfirst) {
      if (this.props.detail["properties"]["区分"] == "死亡") {
        this.state.trapOrEnvSelector = (
          <EnvSelector detail={this.props.detail} />
        );
      } else {
        this.state.trapOrEnvSelector = (
          <TrapSelector detail={this.props.detail} />
        );
      }
      this.state.notfirst = true;
    }
    return (
      <div className="boar_edit_form">
        <div className="__title">
          <h1>捕獲情報編集</h1>
        </div>
        <div className="__description">
          <p>各情報を入力してください。</p>
        </div>
        <div className="__form">
          <form name="form" onSubmit={this.onSubmit}>
            <div className="__form __division">
              <label>区分</label>
              <p></p>
              <select
                name="division"
                id="division"
                onChange={this.onChangeDivision.bind(this)}
                defaultValue={this.props.detail["properties"]["区分"]}
              >
                <option value="調査捕獲">調査捕獲</option>
                <option value="有害捕獲">有害捕獲</option>
                <option value="死亡">死亡</option>
              </select>
            </div>
            <div className="__date">
              <label>捕獲年月日</label>
              <p></p>
              <DateInput
                name="date"
                id="date"
                date={this.props.detail["properties"]["捕獲年月日"]}
              />
            </div>
            <div className="__form __trap_or_env">
              {this.state.trapOrEnvSelector}
            </div>
            <div className="__form __sex">
              <label>性別</label>
              <p></p>
              <select
                name="sex"
                id="sex"
                defaultValue={this.props.detail["properties"]["性別"]}
              >
                <option value="オス">オス</option>
                <option value="メス">メス</option>
                <option value="不明">不明</option>
              </select>
            </div>
            <div className="__length">
              <label>体長(cm)</label>
              <p></p>
              <input
                name="length"
                type="number"
                step="1"
                defaultValue={this.props.detail["properties"]["体長"]}
              ></input>
            </div>
            {/* 体重は体長から計算して送信する（表示しない） */}
          </form>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev.bind(this)}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default BoarEditForm;
