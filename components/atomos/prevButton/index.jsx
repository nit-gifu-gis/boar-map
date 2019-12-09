import Router from "next/router";
import React from "react";

class PrevButton extends React.Component {
  // クリックした場合の処理
  // 引数を取りたい場合はバインドする必要がある
  // (render関数以外ではpropsは呼べない)
  onClick(e) {
    const link = e.target.value;
    Router.push(link);
  }

  render() {
    return (
      <button
        className="PrevButton"
        value={this.props.link}
        onClick={this.onClick.bind(this)}
      >
        前へ
      </button>
    );
  }
}

export default PrevButton;
