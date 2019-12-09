import Router from "next/router";
import React from "react";

class NextButton extends React.Component {
  // クリック時の処理は親の方で定義

  render() {
    return (
      <button className="NextButton" onClick={this.props.bind}>
        次へ
      </button>
    );
  }
}

export default NextButton;
