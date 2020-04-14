import "./vaccineInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";

class VaccineInfo extends React.Component {
  render() {
    let recoverdiv = undefined;
    if (this.props.detail["properties"]["回収年月日"] != "") {
      recoverdiv = [
        <InfoDiv
          title="回収年月日"
          type="date"
          data={this.props.detail["properties"]["回収年月日"]}
        />,
        <InfoDiv
          title="摂食の有無"
          type="text"
          data={this.props.detail["properties"]["摂食の有無"]}
        />,
        <InfoDiv
          title="その他の損傷"
          type="text"
          data={this.props.detail["properties"]["その他破損"]}
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
          title="メッシュ番号"
          type="number"
          data={this.props.detail["properties"]["メッシュ番号"]}
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
