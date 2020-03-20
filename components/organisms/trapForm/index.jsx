import "./trapForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";

const RemoveDateInput = () => (
  <InfoInput title="撤去年月日" type="date" name="removeDate" />
);

class TrapForm extends React.Component {
  state = {
    removeDateInput: null,
    lat: null,
    lng: null
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
  }

  componentDidMount() {
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({ lat: Router.query.lat, lng: Router.query.lng });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
  }

  // データを作る
  createData() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    // 1 設置年月日
    const setDate = form.setDate.value;
    // // 3 位置情報
    // const lat = this.state.lat;
    // const lng = this.state.lng;
    // 4 わなの種類
    const kind = form.kind.options[form.kind.selectedIndex].value;
    // 5 捕獲の有無
    const capture = form.capture.options[form.capture.selectedIndex].value;
    // 2 捕獲年月日
    const removeDate = capture == "あり" ? form.removeDate.value : null;
    // 6 写真?

    // [todo] ここにバリデーション [todo]

    return {
      setDate: setDate,
      removeDate: removeDate,
      kind: kind,
      capture: capture
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
              <InfoInput title="設置年月日" type="date" name="setDate" />
              <InfoInput
                title="わなの種類"
                type="select"
                name="kind"
                options={["箱わな", "くくりわな", "その他"]}
              />
              <InfoInput
                title="捕獲の有無"
                type="select"
                name="capture"
                onChange={this.onChangeCapture.bind(this)}
                options={["なし", "あり"]}
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
