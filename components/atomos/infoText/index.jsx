import React from "react";
import "./infoText.scss";
import "../../../public/static/css/global.scss";

class InfoText extends React.Component {
  render() {
    return (
      <div className="info-text">
        <div className="text">{this.props.children}</div>
      </div>
    );
  }
}

export default InfoText;
