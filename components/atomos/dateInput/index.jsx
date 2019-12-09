import React from "react";

class DateInput extends React.Component {
  isSafari() {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
      console.log("Internet Explorer");
      return false;
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
    const yyyy = document.getElementById("year").value;
    const mm = document.getElementById("month").value;
    const dd = document.getElementById("day").value;
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
    if (this.isSafari()) {
      return (
        <div className="date_input_for_safari">
          <input
            type="number"
            min="1900"
            step="1"
            id="year"
            placeholder="西暦"
            onChange={this.setDate.bind(this)}
          />
          年
          <input
            type="number"
            max="12"
            min="1"
            step="1"
            id="month"
            onChange={this.setDate.bind(this)}
          />
          月
          <input
            type="number"
            max="31"
            min="1"
            step="1"
            id="day"
            onChange={this.setDate.bind(this)}
          />
          日
          <br />
          <input type="date" name={this.props.name} id={this.props.id} />
        </div>
      );
    } else {
      return <input type="date" name={this.props.name} id={this.props.id} />;
    }
  }
}

export default DateInput;
