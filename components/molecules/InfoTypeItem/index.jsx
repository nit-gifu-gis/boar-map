import React from "react";
import "./infoTypeItem.scss";
import InfoTypeItemImage from "../../atomos/infoTypeItemImage";
import InfoTypeItemText from "../../atomos/infoTypeItemText";

class InfoTypeItem extends React.Component {
  render() {
    return (
      <div className="info-type-item">
        <div className="flex">
          <InfoTypeItemImage src={this.props.src} alt={this.props.alt} />
          <InfoTypeItemText text={this.props.text} />
        </div>
      </div>
    );
  }
}

export default InfoTypeItem;
