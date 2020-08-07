import React from "react";
import "./infoDiv.scss";
import "../../../public/static/css/global.scss";
import InfoTitle from "../../atomos/infoTitle";
import InfoText from "../../atomos/infoText";
import dynamic from "next/dynamic";
import ImagesDiv from "../../atomos/imagesDiv";

const DynamicMiniMapComponentWithNoSSR = dynamic(
  () => import("../../atomos/miniMapDiv"),
  { ssr: false }
);

class InfoDiv extends React.Component {
  render() {
    let dataDiv;
    // データが無い時
    if (!this.props.data) {
      dataDiv = <InfoText>&nbsp;</InfoText>;
    }
    // ある時
    else {
      switch (this.props.type) {
        case "text":
          dataDiv = <InfoText>{this.props.data}</InfoText>;
          break;
        case "date":
          const date = new Date(this.props.data);
          dataDiv = (
            <InfoText>
              {date.getFullYear() +
                " / " +
                ("00" + (date.getMonth() + 1)).slice(-2) +
                " / " +
                ("00" + date.getDate()).slice(-2)}
            </InfoText>
          );
          break;
        case "number":
          const num = this.props.data;
          const unit = this.props.unit != null ? this.props.unit : "";
          dataDiv = <InfoText>{num + " " + unit}</InfoText>;
          break;
        case "location":
          const lat = this.props.data.lat;
          const lng = this.props.data.lng;
          dataDiv = <DynamicMiniMapComponentWithNoSSR lat={lat} lng={lng} />;
          break;
        case "images":
          const type = this.props.data.type;
          const objectURLs = this.props.data.objectURLs;
          const imageIDs = this.props.data.imageIDs;
          const confirmMode = this.props.data.confirmMode;
          dataDiv = (
            <ImagesDiv
              type={type}
              objectURLs={objectURLs}
              imageIDs={imageIDs}
              confirmMode={confirmMode}
            />
          );
          break;
        default:
          dataDiv = <InfoText>{this.props.data}</InfoText>;
          break;
      }
    }

    return (
      <div className="info-div">
        <InfoTitle>{this.props.title}</InfoTitle>
        {dataDiv}
      </div>
    );
  }
}

export default InfoDiv;
