import Router from "next/router";
import React from "react";

class PrevButton extends React.Component {
  // クリック時の処理は親の方で定義

  render() {
    return (
      <button className="PrevButton" onClick={this.props.bind}>
        前へ
      </button>
    );
  }
}

export default PrevButton;
