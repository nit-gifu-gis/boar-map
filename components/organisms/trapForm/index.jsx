import "./trapForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";

const RemoveDateInput = props => (
  <InfoInput
    title="撤去年月日"
    type="date"
    name="removeDate"
    defaultValue={props.defaultValue}
  />
);

class TrapForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      removeDateInput: null,
      lat: props.lat,
      lng: props.lng,
      userData: null,
      detail: null
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
    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const capture = detail["properties"]["捕獲の有無"];
      if (capture == "あり") {
        this.setState(_ => {
          return {
            removeDateInput: (
              <RemoveDateInput
                defaultValue={detail["properties"]["撤去年月日"]}
              />
            )
          };
        });
      } else {
        this.setState(_ => {
          return { removeDateInput: null };
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
    // 1 設置年月日
    const setDate = form.setDate.value;
    // // 3 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
    // 4 わなの種類
    const kind = form.kind.options[form.kind.selectedIndex].value;
    // 5 捕獲の有無
    const capture = form.capture.options[form.capture.selectedIndex].value;
    // 2 捕獲年月日
    const removeDate = capture == "あり" ? form.removeDate.value : "";
    // 6 写真?

    // [todo] ここにバリデーション [todo]

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        設置年月日: setDate,
        撤去年月日: removeDate,
        位置情報: "(" + lat + "," + lng + ")",
        罠の種類: kind,
        捕獲の有無: capture
      }
    };
  }

  onChangeCapture() {
    const captureSelect = document.forms.form.capture;
    const capture = captureSelect.options[captureSelect.selectedIndex].value;
    if (capture == "あり") {
      this.setState(_ => {
        return { removeDateInput: <RemoveDateInput /> };
      });
    } else {
      this.setState(_ => {
        return { removeDateInput: null };
      });
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    if (this.state.lat != undefined && this.state.lng != undefined) {
      return (
        <div className="trap-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="画像"
                type="images"
                onChanged={this.props.onChangedImages}
              />
              <InfoInput
                title="設置年月日"
                type="date"
                name="setDate"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["設置年月日"]
                    : null
                }
              />
              <InfoInput
                title="わなの種類"
                type="select"
                name="kind"
                options={["箱わな", "くくりわな", "その他"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["罠の種類"]
                    : null
                }
              />
              <InfoInput
                title="捕獲の有無"
                type="select"
                name="capture"
                onChange={this.onChangeCapture.bind(this)}
                options={["なし", "あり"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["捕獲の有無"]
                    : null
                }
              />
              {this.state.removeDateInput}
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="trapForm">
          <h1>情報取得中...</h1>
        </div>
      );
    }
  }
}

export default TrapForm;
