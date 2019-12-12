import "./vaccineInfo.scss";
import React from "react";

import dynamic from "next/dynamic";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

class VaccineInfo extends React.Component {
  render() {
    let recoverdiv = undefined;
    if (this.props.detail["properties"]["回収年月日"] != "") {
      recoverdiv = (
        <div className="__recover_info">
          <div className="__recover_date">
            <h3>回収年月日</h3>
            <p>{this.props.detail["properties"]["回収年月日"]}</p>
          </div>
          <div className="__eaten">
            <h3>摂食の有無</h3>
            <p>{this.props.detail["properties"]["摂食の有無"]}</p>
          </div>
          <div className="__damage">
            <h3>その他の損傷</h3>
            <p>{this.props.detail["properties"]["その他破損"]}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="vaccine_info_form">
        <div className="__title">
          <h1>ワクチン情報</h1>
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
          <div className="__mesh_number">
            <h3>メッシュ番号</h3>
            <p>{this.props.detail["properties"]["メッシュ番号"]}</p>
          </div>
          <div className="__treat_date">
            <h3>散布年月日</h3>
            <p>{this.props.detail["properties"]["散布年月日"]}</p>
          </div>
          <div className="__treat_number">
            <h3>散布数</h3>
            <p>{this.props.detail["properties"]["散布数"]}</p>
          </div>
          {recoverdiv}
          <div className="__note">
            <h3>備考</h3>
            <p>
              {/* Todo: 改行されないのを修正 */}
              {this.props.detail["properties"]["備考"]}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default VaccineInfo;
