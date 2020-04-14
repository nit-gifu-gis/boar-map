import React from "react";
import "./infoTypeItemText.scss";

class InfoTypeItemText extends React.Component {
  render() {
    return (
      <span className="info-type-item-text">
        <p>{this.props.text}</p>
      </span>
    );
  }
}

export default InfoTypeItemText;
