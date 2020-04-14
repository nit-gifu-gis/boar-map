import React from "react";
import "./infoTypeItemImage.scss";

class InfoTypeItemImage extends React.Component {
  render() {
    return (
      <div className="info-type-item-image">
        <img
          src={this.props.src}
          alt={this.props.alt}
          height="32"
          className="image"
        />
      </div>
    );
  }
}

export default InfoTypeItemImage;
