import "./trapForm.scss";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";
import DateInput from "../../atomos/dateInput";

const RemoveDateInput = () => (
  <div className="__date __remove_date">
    <label>撤去年月日</label>
    <DateInput name="removeDate" id="removeDate" />
  </div>
);

class TrapForm extends React.Component {
  state = {
    removeDateInput: null
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

  // 前へボタンを押したときの処理
  onClickPrev() {
    const url = "/add/location";
    Router.push({ pathname: url, query: { type: "trap" } }, url);
  }

  // 次へボタンを押したときの処理
  onClickNext() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    // 1 設置年月日
    const setDate = form.setDate.value;
    // 3 位置情報
    const lat = Router.query.lat;
    const lng = Router.query.lng;
    // 4 わなの種類
    const kind = form.kind.options[form.kind.selectedIndex].value;
    // 5 捕獲の有無
    const capture = form.capture.options[form.capture.selectedIndex].value;
    // 2 捕獲年月日
    const removeDate = capture == "あり" ? form.removeDate.value : null;
    // 6 写真?
    // 確認画面に遷移
    const url = "/add/confirm/trap";
    Router.push(
      {
        pathname: url,
        query: {
          setDate: setDate,
          removeDate: removeDate,
          lat: lat,
          lng: lng,
          kind: kind,
          capture: capture
        }
      },
      url
    );
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

  render() {
    return (
      <div className="trapForm">
        <div className="__title">
          <h1>わな情報登録</h1>
        </div>
        <div className="__description">
          <p>各情報を入力してください。</p>
        </div>
        <div className="__form">
          <form name="form">
            <div className="__date __set_date">
              <label>設置年月日</label>
              <DateInput name="setDate" id="setDate" />
            </div>
            <div className="__form __kind">
              <label>わなの種類</label>
              <select name="kind" id="kind">
                <option value="箱わな">箱わな</option>
                <option value="くくりわな">くくりわな</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div className="__form __capture">
              <label>捕獲の有無</label>
              <select
                name="capture"
                id="capture"
                onChange={this.onChangeCapture.bind(this)}
              >
                <option value="なし">なし</option>
                <option value="あり">あり</option>
              </select>
            </div>
            {this.state.removeDateInput}
          </form>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default TrapForm;
