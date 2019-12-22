import "./boarInfo.scss";
import React from "react";
import dynamic from "next/dynamic";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

class BoarInfo extends React.Component {
  render() {
    return (
      <div className="boar_info_form">
        <div className="__title">
          <h1>捕獲情報</h1>
        </div>
        <div className="__info">
          <div className="__location">
            <h3>場所</h3>
            <div className="__map_canvas">
              <DynamicMapComponentWithNoSSR
                lat={this.props.detail["geometry"]["coordinates"][1]}
                lng={this.props.detail["geometry"]["coordinates"][0]}
              />
            </div>
          </div>
          <div className="__division">
            <h3>区分</h3>
            <p>{this.props.detail["properties"]["区分"]}</p>
          </div>
          <div className="__date">
            <h3>捕獲年月日</h3>
            <p>{this.props.detail["properties"]["捕獲年月日"]}</p>
          </div>
          <div className="__trap_or_env">
            <h3>わな・発見場所</h3>
            <p>{this.props.detail["properties"]["罠・発見場所"]}</p>
          </div>
          <div className="__sex">
            <h3>性別</h3>
            <p>{this.props.detail["properties"]["性別"]}</p>
          </div>
          <div className="__length">
            <h3>体長</h3>
            <p>{this.props.detail["properties"]["体長"]}cm</p>
          </div>
          <div className="__weight">
            <h3>体重</h3>
            <p>
              {this.props.detail["properties"]["体重"]}kg (体長から自動計算)
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default BoarInfo;
