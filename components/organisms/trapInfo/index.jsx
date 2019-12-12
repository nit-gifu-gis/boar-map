import "./trapInfo.scss";
import React from "react";
import dynamic from "next/dynamic";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

class TrapInfo extends React.Component {
  state = {
    removeDateDiv: null
  };
  render() {
    let removediv = undefined;
    if (this.props.detail["properties"]["撤去年月日"] != "") {
      removediv = (
        <div className="__remove_date">
          <h3>撤去年月日</h3>
          <p>{this.props.detail["properties"]["撤去年月日"]}</p>
        </div>
      );
    }
    return (
      <div className="trap_info_form">
        <div className="__title">
          <h1>わな情報</h1>
        </div>
        <div className="__location">
          <h3>場所</h3>
          <div className="__map_canvas">
            <DynamicMapComponentWithNoSSR
              lat={this.props.detail["geometry"]["coordinates"][1]}
              lng={this.props.detail["geometry"]["coordinates"][0]}
            />
          </div>
        </div>
        <div className="__info">
          <div className="__set_date">
            <h3>設置年月日</h3>
            <p>{this.props.detail["properties"]["設置年月日"]}</p>
          </div>
          <div className="__kind">
            <h3>わなの種類</h3>
            <p>{this.props.detail["properties"]["罠の種類"]}</p>
          </div>
          <div className="__capture">
            <h3>捕獲の有無</h3>
            <p>{this.props.detail["properties"]["捕獲の有無"]}</p>
          </div>
          {removediv}
        </div>
      </div>
    );
  }
}

export default TrapInfo;
