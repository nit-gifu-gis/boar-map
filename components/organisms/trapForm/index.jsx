import "./trapForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import UserData from "../../../utils/userData";

class TrapForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captured: false,
      lat: props.lat,
      lng: props.lng,
      userData: UserData.getUserData(),
      detail: null,
      error: {
        setDate: null,
        removeDate: null
      }
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
    this.updateError.bind(this);
    this.validateSetDate.bind(this);
    this.validateRemoveDate.bind(this);
    this.validateDates.bind(this);
    this.validateDetail.bind(this);
  }

  componentDidMount() {
    // T, U, S, K以外は登録不可
    const userDepartment = this.state.userData.department;
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
      const capture = detail["properties"]["捕獲の有無"];
      if (capture == "あり") {
        this.setState({
          captured: true
        });
      } else {
        this.setState({
          captured: false
        });
      }
    }
  }

  async updateError(key, value) {
    const e = deepClone(this.state.error);
    console.log(e);
    e[key] = value;
    this.setState({ error: e });
  }

  async validateSetDate() {
    const form = document.forms.form;
    const setDateStr = form.setDate.value;
    const date = new Date(setDateStr);
    // 日付が不正
    if (date.toString() === "Invalid Date") {
      await this.updateError("setDate", "日付が入力されていません。");
      return;
    }
    // 今日の日付
    const today = new Date();
    if (compareDate(date, today) > 0) {
      // 未来の日付だったら不正
      await this.updateError("setDate", "未来の日付が入っています。");
      return;
    }
    await this.updateError("setDate", null);
  }

  async validateRemoveDate() {
    if (!this.state.captured) {
      // 撤去していない場合はエラーなし
      await this.updateError("removeDate", null);
      return;
    }
    const form = document.forms.form;
    const removeDateStr = form.removeDate.value;
    const date = new Date(removeDateStr);
    // 日付が不正
    if (date.toString() === "Invalid Date") {
      await this.updateError("removeDate", "日付が入力されていません。");
      return;
    }
    // 今日の日付
    const today = new Date();
    if (compareDate(date, today) > 0) {
      // 未来の日付だったら不正
      await this.updateError("removeDate", "未来の日付が入っています。");
      return;
    }
    await this.updateError("removeDate", null);
  }

  async validateDates() {
    if (!this.state.captured) {
      return;
    }
    if (
      this.state.error.setDate != null ||
      this.state.error.removeDate != null
    ) {
      // そもそも日付がエラーなら確認するまでもない
      return;
    }
    const form = document.forms.form;
    const setDateStr = form.setDate.value;
    const removeDateStr = form.removeDate.value;
    const setDate = new Date(setDateStr);
    const removeDate = new Date(removeDateStr);
    // 設置年月日 > 撤去年月日ならエラー
    if (compareDate(setDate, removeDate) > 0) {
      await this.updateError(
        "removeDate",
        "設置年月日との整合性が取れません。"
      );
      return;
    }
    await this.updateError("setDate", null);
    await this.updateError("removeDate", null);
  }

  async validateDetail() {
    // 全部チェックしていく
    await this.validateSetDate();
    await this.validateRemoveDate();
    await this.validateDates();

    // エラー一覧を表示
    let valid = true;
    Object.keys(this.state.error).forEach(key => {
      if (this.state.error[key] != null) {
        console.error(this.state.error[key]);
        valid = false;
      }
    });
    return valid;
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
        return { captured: true };
      });
    } else {
      this.setState(_ => {
        return { captured: false };
      });
    }
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    if (this.state.lat != undefined && this.state.lng != undefined) {
      let removeDateInput = null;
      if (this.state.captured) {
        removeDateInput = (
          <InfoInput
            title="撤去年月日"
            type="date"
            name="removeDate"
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["撤去年月日"]
                : null
            }
            onChange={this.validateRemoveDate.bind(this)}
            errorMessage={this.state.error.removeDate}
            required={true}
          />
        );
      }
      return (
        <div className="trap-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="画像"
                type="images"
                onChange={this.props.onChangedImages}
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
                required={true}
                onChange={this.validateSetDate.bind(this)}
                errorMessage={this.state.error.setDate}
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
              {removeDateInput}
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
