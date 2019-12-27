import React from "react";

class DateInput extends React.Component {
  isSafari() {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.indexOf("iphone") != -1) {
      console.log("iPhone");
      return false;
    } else if (userAgent.indexOf("ipad") != -1) {
      console.log("iPad");
      return false;
    } else if (userAgent.indexOf("android") != -1) {
      if (userAgent.indexOf("mobile") != -1) {
        console.log("android");
        return false;
      } else {
        console.log("android");
        return false;
      }
    } else if (
      userAgent.indexOf("msie") != -1 ||
      userAgent.indexOf("trident") != -1
    ) {
      console.log("Internet Explorer");
      return true;
    } else if (userAgent.indexOf("edge") != -1) {
      console.log("Edge");
      return false;
    } else if (userAgent.indexOf("chrome") != -1) {
      console.log("Google Chrome");
      return false;
    } else if (userAgent.indexOf("safari") != -1) {
      console.log("Safari");
      return true;
    } else if (userAgent.indexOf("firefox") != -1) {
      console.log("FireFox");
      return false;
    } else if (userAgent.indexOf("opera") != -1) {
      console.log("Opera");
      return false;
    } else {
      console.log("不明なブラウザ");
      return false;
    }
  }

  setDate() {
    const yyyy = document.getElementById(this.props.id + "Year").value;
    const mm = document.getElementById(this.props.id + "Month").value;
    const dd = document.getElementById(this.props.id + "Day").value;
    const date = yyyy + "-" + mm + "-" + dd;
    // console.log(date);
    if (yyyy != "" && mm != "" && dd != "") {
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
    } else {
      // 未入力欄がある場合
      document.getElementById(this.props.id).value = null;
    }
  }

  render() {
    let DateY = "";
    let DateM = "";
    let DateD = "";
    if (this.props.date != null) {
      const date = this.props.date.split(" ")[0].split("/");
      if (date.length >= 3) {
        DateY = date[0];
        DateM = date[1];
        DateD = date[2];
      }
    }
    if (this.isSafari()) {
      return (
        <div className="date_input_for_safari">
          <input
            type="number"
            min="1900"
            step="1"
            id={this.props.id + "Year"}
            placeholder="西暦"
            defaultValue={DateY}
            onChange={this.setDate.bind(this)}
          />
          年
          <input
            type="number"
            max="12"
            min="1"
            step="1"
            id={this.props.id + "Month"}
            defaultValue={DateM}
            onChange={this.setDate.bind(this)}
          />
          月
          <input
            type="number"
            max="31"
            min="1"
            step="1"
            id={this.props.id + "Day"}
            defaultValue={DateD}
            onChange={this.setDate.bind(this)}
          />
          日
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
      return (
        <input
          type="date"
          className="__date_input"
          name={this.props.name}
          id={this.props.id}
          defaultValue={DateY + "-" + DateM + "-" + DateD}
        />
      );
    }
  }
}

export default DateInput;
