import "./vaccineInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";
import UserData from "../../../utils/userData";

class VaccineInfo extends React.Component {
  render() {
    // W,K以外には表示しない
    const userData = UserData.getUserData();
    const userDepartment = userData.department;
    if (userDepartment != "W" && userDepartment != "K") {
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
          title="画像"
          type="images"
          data={{
            type: "vaccine",
            imgs: this.props.imgs,
            waitingPublish: this.props.waitingPublish
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
