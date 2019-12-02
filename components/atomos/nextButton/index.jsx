import Router from "next/router";
import React from "react";

class NextButton extends React.Component {
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
        className="NextButton"
        value={this.props.link}
        onClick={this.onClick.bind(this)}
      >
        次へ
      </button>
    );
  }
}

export default NextButton;
