import React from "react";
import "./roundButton.scss";
import "../../../public/static/css/global.scss";

class RoundButton extends React.Component {
  // クリック時の処理は親の方で定義
  constructor(props) {
    super(props);
  }

  render() {
    let bgColor = "#ff9800";
    switch (this.props.color) {
      case "primary":
        bgColor = "#ff9800";
        break;
      case "accent":
        bgColor = "#536dfe";
        break;
      case "danger":
        bgColor = "#ff0000";
        break;
      case "excel":
        bgColor = "#217346";
        break;
      default:
        break;
    }

    if (this.props.enabled == false) {
      return (
        <button className="round_button" onClick={this.props.bind} disabled>
          {this.props.children}
        </button>
      );
    } else {
      return (
        <button
          className="round_button"
          onClick={this.props.bind}
          style={{ backgroundColor: bgColor }}
        >
          {this.props.children}
        </button>
      );
    }
  }
}

export default RoundButton;
