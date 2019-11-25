import React from "react";
import "./infoTypeItemImage.scss";

class InfoTypeItemImage extends React.Component {
  render() {
    return (
      <span className="InfoTypeItemImage">
        <img src={this.props.src} alt={this.props.alt} width="32" />
      </span>
    );
  }
}

export default InfoTypeItemImage;
