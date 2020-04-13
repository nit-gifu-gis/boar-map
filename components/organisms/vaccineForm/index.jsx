import "./vaccineForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";

const RecoverInfoForm = props => (
  <div>
    <InfoInput
      title="回収年月日"
      type="date"
      name="recoverDate"
      defaultValue={props.recoverDate}
    />
    <InfoInput
      title="摂食の有無"
      type="select"
      name="eaten"
      options={["なし", "あり"]}
      defaultValue={props.eaten}
    />
    <InfoInput
      title="その他の破損"
      type="select"
      name="damage"
      options={["なし", "あり"]}
      defaultValue={props.damage}
    />
  </div>
);

class VaccineForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recover: false,
      recoverInfoForm: null,
      lat: null,
      lng: null,
      userData: null
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
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
      this.state.userData = userData;
    } else {
      return;
    }
  }

  componentDidMount() {
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({ lat: Router.query.lat, lng: Router.query.lng });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const recover = detail["properties"]["回収年月日"];
      if (recover != "") {
        this.setState(_ => {
          return {
            recoverInfoForm: (
              <RecoverInfoForm
                recoverDate={detail["properties"]["回収年月日"]}
                eaten={detail["properties"]["摂食の有無"]}
                damage={detail["properties"]["その他破損"]}
              />
            ),
            recover: true
          };
        });
      } else {
        this.setState(_ => {
          return { recoverInfoForm: null, recover: false };
        });
      }
    }
  }

  // データを作る
  createDetail() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user = this.state.userData.user_id;
    // 1 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 2 メッシュ番号
    const meshNumber = form.meshNumber.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = this.state.recover;
    // 5 回収年月日
    let recoverDate = "";
    // 6 摂食の有無
    let eaten = "";
    // 7 その他破損
    let damage = "";
    // 8 破損なし
    // 多分構成ミスなので無し
    // 9 備考
    const note = form.note.value;
    if (recover) {
      recoverDate = form.recoverDate.value;
      eaten = form.eaten.options[form.eaten.selectedIndex].value;
      damage = form.damage.options[form.damage.selectedIndex].value;
    }

    // [todo] ここにバリデーション [todo]

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        位置情報: "(" + lat + "," + lng + ")",
        メッシュ番号: meshNumber,
        散布年月日: treatDate,
        散布数: treatNumber,
        回収年月日: recoverDate,
        摂食の有無: eaten,
        その他破損: damage,
        備考: note
      }
    };
  }

  // 回収が変更されたときに呼ばれる
  onChangeRecover() {
    const recoverSelect = document.forms.form.recover;
    const recover = recoverSelect.options[recoverSelect.selectedIndex].value;
    if (recover == "回収済") {
      this.setState(_ => {
        return { recoverInfoForm: <RecoverInfoForm />, recover: true };
      });
    } else {
      this.setState(_ => {
        return { recoverInfoForm: null, recover: false };
      });
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    console.log("check");
    if (this.state.lng != undefined && this.state.lat != undefined) {
      return (
        <div className="vaccine-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="メッシュ番号"
                type="number"
                name="meshNumber"
                min="0"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["メッシュ番号"]
                    : null
                }
              />
              <InfoInput
                title="散布年月日"
                type="date"
                name="treatDate"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["散布年月日"]
                    : null
                }
              />
              <InfoInput
                title="散布数"
                type="number"
                name="treatNumber"
                min="1"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["散布数"]
                    : null
                }
              />
              <InfoInput
                title="回収状況"
                type="select"
                name="recover"
                onChange={this.onChangeRecover.bind(this)}
                options={["未回収", "回収済"]}
                defaultValue={this.state.recover ? "回収済" : "未回収"}
              />
              {this.state.recoverInfoForm}
              <InfoInput
                title="備考"
                type="text-area"
                rows="4"
                name="note"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["備考"]
                    : null
                }
              />
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="vaccineForm">
          <h1>情報取得中</h1>
        </div>
      );
    }
  }
}

export default VaccineForm;
