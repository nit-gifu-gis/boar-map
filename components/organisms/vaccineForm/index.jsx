import "./vaccineForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import UserData from "../../../utils/userData";

const RecoverInfoForm = props => (
  <div>
    <InfoInput
      title="回収年月日"
      type="date"
      name="recoverDate"
      defaultValue={props.recoverDate}
    />
    <InfoInput
      title="いのししの摂食数"
      type="number"
      name="eatenNum"
      min={0}
      step={1}
      defaultValue={props.eatenNum}
    />
    <InfoInput
      title="その他の破損数"
      type="number"
      name="damageNum"
      min={0}
      step={1}
      defaultValue={props.damageNum}
    />
    <InfoInput
      title="破損なし"
      type="number"
      name="noDamageNum"
      min={0}
      step={1}
      defaultValue={props.noDamageNum}
    />
  </div>
);

class VaccineForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recover: false,
      recoverInfoForm: null,
      lat: props.lat,
      lng: props.lng,
      userData: UserData.getUserData()
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
  }

  componentDidMount() {
    // W, K以外は登録不可
    const userDepartment = this.state.userData.department;
    if (userDepartment != "W" && userDepartment != "K") {
      console.log("Permission Denied: この情報にはアクセスできません");
      Router.push("/map");
      return;
    }
    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const recover = detail["properties"]["回収年月日"];
      if (recover) {
        this.setState(_ => {
          return {
            recoverInfoForm: (
              <RecoverInfoForm
                recoverDate={detail["properties"]["回収年月日"]}
                eatenNum={detail["properties"]["摂食数"]}
                damageNum={detail["properties"]["その他の破損数"]}
                noDamageNum={detail["properties"]["破損なし"]}
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
    const meshNo = form.meshNo.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = this.state.recover;
    // 5 回収年月日
    let recoverDate = "";
    // 6 摂食数
    let eatenNum = "";
    // 7 その他の破損数
    let damageNum = "";
    // 8 破損なし
    let noDamageNum = "";
    // 9 備考
    const note = form.note.value;
    if (recover) {
      recoverDate = form.recoverDate.value;
      eatenNum = form.eatenNum.value;
      damageNum = form.damageNum.value;
      noDamageNum = form.noDamageNum.value;
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
        メッシュNO: meshNo,
        散布年月日: treatDate,
        散布数: treatNumber,
        回収年月日: recoverDate,
        摂食数: eatenNum,
        その他の破損数: damageNum,
        破損なし: noDamageNum,
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
                title="画像"
                type="images"
                onChanged={this.props.onChangedImages}
              />
              <InfoInput
                title="メッシュ番号"
                type="mesh-num"
                name="meshNo"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["メッシュNO"]
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
