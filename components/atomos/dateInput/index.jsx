import React from "react";
import "./deteInput.scss";
import "../../../public/static/css/global.scss";
import TextInput from "../textInput";
import { getDevice, getBrowser } from "../../../utils/utils";

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
    const isSafari = () => {
      const device = getDevice();
      // PC以外は大丈夫
      if (device !== "mac" && device !== "windows_pc") return false;
      // ieとsafariだけtrue
      const browser = getBrowser();
      if (browser === "ie" || browser === "safari") return true;
      else return false;
    };

    const res = isSafari();
    return new Promise(resolve => {
      this.setState({ isSafari: res }, resolve(res));
    });
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
    // console.log(dt);
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
    await this.confirmSafari();
    // 初期値の確認
    if (this.props.date != null) {
      // 正規表現でチェック，区切りは"-"または"/"
      const regexp = new RegExp("(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})", "g");
      const result = regexp.exec(this.props.date);
      if (result == null) {
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
                disabled={this.props.disabled}
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
                disabled={this.props.disabled}
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
                disabled={this.props.disabled}
              />
            </div>
            日
          </div>
          <br />
          <input
            type="date"
            name={this.props.name}
            id={this.props.id}
            min={this.props.min}
            max={this.props.max}
            disabled={this.props.disabled}
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
            min={this.props.min}
            max={this.props.max}
            disabled={this.props.disabled}
          />
        </div>
      );
    }
  }
}

export default DateInput;
