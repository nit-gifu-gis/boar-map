import "./vaccineInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";
import { hasReadPermission } from "../../../utils/gis";

class VaccineInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readable: false
    };
  }

  componentDidMount() {
    if (hasReadPermission("vaccine")) this.setState({ readable: true });
  }

  render() {
    // W,K以外には表示しない
    if (!this.state.readable) {
      return (
        <div className="vaccine_info_form">
          エラー：情報を表示する権限がありません。
        </div>
      );
    }
    let recoverdiv = undefined;
    if (this.props.detail["properties"]["回収年月日"] != "") {
      recoverdiv = [
        <InfoDiv
          title="回収年月日"
          type="date"
          data={this.props.detail["properties"]["回収年月日"]}
        />,
        <InfoDiv
          title="いのししの摂食数"
          type="text"
          data={this.props.detail["properties"]["摂食数"]}
        />,
        <InfoDiv
          title="その他の破損数"
          type="text"
          data={this.props.detail["properties"]["その他の破損数"]}
        />,
        <InfoDiv
          title="破損なし"
          type="text"
          data={this.props.detail["properties"]["破損なし"]}
        />,
        <InfoDiv
          title="ロスト数"
          type="text"
          data={this.props.detail["properties"]["ロスト数"]}
        />
      ];
    }
    return (
      <div className="vaccine_info_form">
        <InfoDiv
          title="場所"
          type="location"
          data={{
            lat: this.props.detail["geometry"]["coordinates"][1],
            lng: this.props.detail["geometry"]["coordinates"][0]
          }}
        />
        <InfoDiv
          title="画像"
          type="images"
          data={{
            type: "vaccine",
            objectURLs: this.props.objectURLs,
            imageIDs: this.props.imageIDs,
            confirmMode: this.props.confirmMode
          }}
        />
        <InfoDiv
          title="メッシュ番号"
          type="text"
          data={this.props.detail["properties"]["メッシュNO"]}
        />
        <InfoDiv
          title="散布年月日"
          type="date"
          data={this.props.detail["properties"]["散布年月日"]}
        />
        <InfoDiv
          title="散布数"
          type="number"
          data={this.props.detail["properties"]["散布数"]}
        />
        {recoverdiv}
        <InfoDiv
          title="備考"
          type="longText"
          data={this.props.detail["properties"]["備考"]}
        />
      </div>
    );
  }
}

export default VaccineInfo;
