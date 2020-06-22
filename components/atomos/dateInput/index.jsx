import React from "react";
import "./deteInput.scss";
import "../../../public/static/css/global.scss";
import TextInput from "../textInput";

// 初期値を設定しないと自動で今日の日付を初期値にします

class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isErrorForSafari: false,
      onChange: function changed() {}
    };
    if (this.props.onChange != undefined) {
      this.state.onChange = this.props.onChange;
    }
  }

  isSafari() {
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

  setDateForSafari() {
    const yearValue = document.getElementById(this.props.id + "Year").value;
    const monthValue = document.getElementById(this.props.id + "Month").value;
    const dayValue = document.getElementById(this.props.id + "Day").value;
    // 空文字がある場合はエラー
    // 年が4桁じゃ無いのもエラー
    if (yearValue.length != 4 || monthValue == "" || dayValue == "") {
      // 未入力欄がある場合
      document.getElementById(this.props.id).value = null;
      console.log("未入力がある");
      this.setState({
        isErrorForSafari: true
      });
      this.state.onChange();
      return;
    }
    const yyyy = ("0000" + yearValue).slice(-4);
    const mm = ("00" + monthValue).slice(-2);
    const dd = ("00" + dayValue).slice(-2);
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
      this.setState({
        isErrorForSafari: false
      });
      this.state.onChange();
    } else {
      document.getElementById(this.props.id).value = null;
      this.setState({
        isErrorForSafari: true
      });
      this.state.onChange();
    }
  }

  state = {
    isBrowser: false
  };

  componentDidMount() {
    this.setState({ isBrowser: true });
  }

  render() {
    let className;
    if (this.state.isBrowser) {
      // 初期値設定
      let DateY = "";
      let DateM = "";
      let DateD = "";
      if (this.props.date != null) {
        // 外部から初期値が指定されている場合
        // "-"区切りと"/"区切りに対応
        let date = this.props.date.split(" ")[0].split("-");
        if (date.length == 3) {
          DateY = date[0];
          DateM = date[1];
          DateD = date[2];
        } else {
          date = date[0].split("/");
          if (date.length == 3) {
            DateY = date[0];
            DateM = date[1];
            DateD = date[2];
          }
        }
      } else {
        // 初期値が設定されていない場合は今日の日付をセット
        const today = new Date();
        DateY = ("0000" + today.getFullYear()).slice(-4);
        DateM = ("00" + (today.getMonth() + 1)).slice(-2);
        DateD = ("00" + today.getDate()).slice(-2);
      }
      if (this.isSafari()) {
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
                  defaultValue={DateY}
                  onChange={this.setDateForSafari.bind(this)}
                  error={this.state.isErrorForSafari || this.props.error}
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
                  defaultValue={DateM}
                  onChange={this.setDateForSafari.bind(this)}
                  error={this.state.isErrorForSafari || this.props.error}
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
                  defaultValue={DateD}
                  onChange={this.setDateForSafari.bind(this)}
                  error={this.state.isErrorForSafari || this.props.error}
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
              defaultValue={DateY + "-" + DateM + "-" + DateD}
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
              defaultValue={
                DateY +
                "-" +
                ("0" + DateM).slice(-2) +
                "-" +
                ("0" + DateD).slice(-2)
              }
              placeholder={"年/月/日"}
              onChange={this.state.onChange}
            />
          </div>
        );
      }
    } else {
      return <></>;
    }
  }
}

export default DateInput;
