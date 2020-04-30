import "./boarForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import UserData from "../../../utils/userData";

const TrapSelector = props => (
  <InfoInput
    title="わなの種類"
    type="select"
    name="trap"
    options={["箱わな", "くくりわな", "その他"]}
    defaultValue={props.defaultValue}
  />
);

const EnvSelector = props => (
  <InfoInput
    title="発見場所"
    type="select"
    name="env"
    options={["山際", "山地", "その他"]}
    defaultValue={props.defaultValue}
  />
);

class BoarForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trapOrEnvSelector: <TrapSelector />,
      lat: props.lat,
      lng: props.lng,
      userData: UserData.getUserData(),
      detail: null
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
  }

  componentDidMount() {
    // T, U, S, K以外は登録不可
    const userDepartment = UserData.getUserDepartment();
    if (
      userDepartment != "T" &&
      userDepartment != "U" &&
      userDepartment != "S" &&
      userDepartment != "K"
    ) {
      console.log("Permission Denied: この情報にはアクセスできません");
      Router.push("/map");
      return;
    }

    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const division = detail["properties"]["区分"];
      switch (division) {
        case "死亡":
          this.setState(_ => {
            return {
              trapOrEnvSelector: (
                <EnvSelector
                  defaultValue={detail["properties"]["罠・発見場所"]}
                />
              )
            };
          });
          break;
        default:
          this.setState(_ => {
            return {
              trapOrEnvSelector: (
                <TrapSelector
                  defaultValue={detail["properties"]["罠・発見場所"]}
                />
              )
            };
          });
          break;
      }
    }
  }

  // データを作る
  createDetail() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user = this.state.userData.user_id;
    // 1 区分
    const division = form.division.options[form.division.selectedIndex].value;
    // 2 捕獲年月日
    const date = form.date.value;
    // // 3 位置情報
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

    // [todo] ここにバリデーション [todo]

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        区分: division,
        捕獲年月日: date,
        位置情報: "(" + lat + "," + lng + ")",
        "罠・発見場所": trapOrEnv,
        性別: sex,
        体長: length,
        体重: weight
      }
    };
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
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="画像"
                type="images"
                onChanged={this.props.onChangedImages}
              />
              <InfoInput
                title="区分"
                type="select"
                name="division"
                options={["調査捕獲", "有害捕獲", "死亡"]}
                onChange={this.onChangeDivision.bind(this)}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["区分"]
                    : null
                }
              />
              <InfoInput
                title="捕獲年月日"
                type="date"
                name="date"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["捕獲年月日"]
                    : null
                }
              />
              {this.state.trapOrEnvSelector}
              <InfoInput
                title="性別"
                type="select"
                name="sex"
                options={["オス", "メス", "不明"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["性別"]
                    : null
                }
              />
              <InfoInput
                title="体長 (cm)"
                type="number"
                name="length"
                min="1"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["体長"]
                    : null
                }
              />
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
