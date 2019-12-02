import React from "react";
import "./infoTypeItemText.scss";

class InfoTypeItemText extends React.Component {
  render() {
    return (
      <span className="InfoTypeItemText">
        <p>{this.props.text}</p>
      </span>
    );
  }
}

export default InfoTypeItemText;
