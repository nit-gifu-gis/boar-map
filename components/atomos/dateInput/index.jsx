import React from "react";
import "./deteInput.scss";
import "../../../public/static/css/global.scss";
import TextInput from "../textInput";

// 初期値を設定しないと自動で今日の日付を初期値にします

class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSafari: false,
      onChange: function changed() {}
    };
    if (this.props.onChange != undefined) {
      this.state.onChange = this.props.onChange;
    }
    this.onChangeValueForSafari.bind(this);
    this.setDate.bind(this);
    this.initForm.bind(this);
  }

  confirmSafari() {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.indexOf("iphone") != -1) {
      // console.log("iPhone");
      return false;
    } else if (userAgent.indexOf("ipad") != -1) {
      // console.log("iPad");
      return false;
    } else if (userAgent.indexOf("android") != -1) {
      if (userAgent.indexOf("mobile") != -1) {
        // console.log("android");
        return false;
      } else {
        // console.log("android");
        return false;
      }
    } else if (
      userAgent.indexOf("msie") != -1 ||
      userAgent.indexOf("trident") != -1
    ) {
      // console.log("Internet Explorer");
      return true;
    } else if (userAgent.indexOf("edge") != -1) {
      // console.log("Edge");
      return false;
    } else if (userAgent.indexOf("chrome") != -1) {
      // console.log("Google Chrome");
      return false;
    } else if (userAgent.indexOf("safari") != -1) {
      // console.log("Safari");
      return true;
    } else if (userAgent.indexOf("firefox") != -1) {
      // console.log("FireFox");
      return false;
    } else if (userAgent.indexOf("opera") != -1) {
      // console.log("Opera");
      return false;
    } else {
      // console.log("不明なブラウザ");
      return false;
    }
  }

  onChangeValueForSafari() {
    const yearValue = document.getElementById(this.props.id + "Year").value;
    const monthValue = document.getElementById(this.props.id + "Month").value;
    const dayValue = document.getElementById(this.props.id + "Day").value;
    this.setDate(yearValue, monthValue, dayValue);
    this.state.onChange();
  }

  setDate(year, month, day) {
    // 空文字がある場合はエラー
    // 年が4桁じゃ無いのもエラー
    if ((year + "").length != 4 || month + "" == "" || day + "" == "") {
      // 未入力欄がある場合
      document.getElementById(this.props.id).value = null;
      return;
    }
    const yyyy = ("0000" + year).slice(-4);
    const mm = ("00" + month).slice(-2);
    const dd = ("00" + day).slice(-2);
    const date = yyyy + "-" + mm + "-" + dd;
    // window.alert(date);
    // 全部空文字じゃ無いなら日付として正しいか判定
    const dt = new Date(yyyy, mm - 1, dd);
    console.log(dt);
    if (
      dt.getFullYear() == yyyy &&
      dt.getMonth() == mm - 1 &&
      dt.getDate() == dd
    ) {
      document.getElementById(this.props.id).value = date;
    } else {
      document.getElementById(this.props.id).value = null;
    }
  }

  async componentDidMount() {
    await this.setState({ isSafari: this.confirmSafari() });
    // 初期値の確認
    if (this.props.date != null) {
      // 正規表現でチェック，区切りは"-"または"/"
      const regexp = new RegExp("(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})", "gu");
      const result = regexp.exec(this.props.date);
      console.log(result);
      if (result == null) {
        console.log("check");
        // 正規表現に引っかからないなら，初期値なしのときの処理
        this.initForm();
        return;
      }
      // 引っかかったらそれぞれ取り出して
      const yearValue = result[1];
      const monthValue = result[2];
      const dayValue = result[3];
      // 内部データセット
      this.setDate(yearValue, monthValue, dayValue);
      // safariは見た目もセット
      if (this.state.isSafari) {
        document.getElementById(this.props.id + "Year").value = yearValue;
        document.getElementById(this.props.id + "Month").value = monthValue;
        document.getElementById(this.props.id + "Day").value = dayValue;
      }
      return;
    } else {
      // 初期値なし
      this.initForm();
      return;
    }
  }

  initForm() {
    const today = new Date();
    const yearValue = ("0000" + today.getFullYear()).slice(-4);
    const monthValue = ("00" + (today.getMonth() + 1)).slice(-2);
    const dayValue = ("00" + today.getDate()).slice(-2);
    this.setDate(yearValue, monthValue, dayValue);
    if (this.state.isSafari) {
      document.getElementById(this.props.id + "Year").value = yearValue;
      document.getElementById(this.props.id + "Month").value = monthValue;
      document.getElementById(this.props.id + "Day").value = dayValue;
    }
  }

  render() {
    let className;
    if (this.state.isSafari) {
      return (
        <div className="date-input-for-safari">
          <div className="date-form-element year-element">
            <div className="year-input">
              <TextInput
                type="number"
                min="1900"
                step="1"
                id={this.props.id + "Year"}
                placeholder="西暦"
                onChange={this.onChangeValueForSafari.bind(this)}
                error={this.props.error}
              />
            </div>
            年
          </div>
          <div className="date-form-element month-element">
            <div className="month-input">
              <TextInput
                type="number"
                max="12"
                min="1"
                step="1"
                id={this.props.id + "Month"}
                onChange={this.onChangeValueForSafari.bind(this)}
                error={this.props.error}
              />
            </div>
            月
          </div>
          <div className="date-form-element day-element">
            <div className="day-input">
              <TextInput
                type="number"
                max="31"
                min="1"
                step="1"
                id={this.props.id + "Day"}
                onChange={this.onChangeValueForSafari.bind(this)}
                error={this.props.error}
              />
            </div>
            日
          </div>
          <br />
          <input
            type="date"
            name={this.props.name}
            id={this.props.id}
            style={{ display: "none" }}
          />
        </div>
      );
    } else {
      className = "date-input-div__input";
      if (this.props.error) {
        className += "--error";
      }
      return (
        <div className="date-input-div">
          <input
            type="date"
            className={className}
            name={this.props.name}
            id={this.props.id}
            placeholder={"年/月/日"}
            onChange={this.state.onChange}
          />
        </div>
      );
    }
  }
}

export default DateInput;
