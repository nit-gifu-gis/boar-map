import "./detailFooter.scss";
import React from "react";

class DetailFooter extends React.Component {
  render() {
    return (
      <div className="detailFooter">
        <div className="flex">
          <button className="PrevButton" onClick={this.props.prevHandler}>
            戻る
          </button>
          <button className="NextButton" onClick={this.props.nextHandler}>
            編集
          </button>
        </div>
      </div>
    );
  }
}

export default DetailFooter;
