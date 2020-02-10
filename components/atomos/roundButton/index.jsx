import React from "react";
import "./roundButton.scss";
import "../../../utils/global.scss";

class RoundButton extends React.Component {
  // クリック時の処理は親の方で定義

  render() {
    return (
      <button className="round_button" onClick={this.props.bind}>
        {this.props.children}
      </button>
    );
  }
}

export default RoundButton;
