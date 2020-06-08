import "./boarInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";

class BoarInfo extends React.Component {
  render() {
    return (
      <div className="boar-info">
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
            type: "boar",
            imgs: this.props.imgs,
            waitingPublish: this.props.waitingPublish
          }}
        />
        <InfoDiv
          title="メッシュ番号"
          type="text"
          data={this.props.detail["properties"]["メッシュ番号"]}
        />
        <InfoDiv title="区分" data={this.props.detail["properties"]["区分"]} />
        <InfoDiv
          title="捕獲年月日"
          type="date"
          data={this.props.detail["properties"]["捕獲年月日"]}
        />
        <InfoDiv
          title="わな・発見場所"
          data={this.props.detail["properties"]["罠・発見場所"]}
        />
        <InfoDiv
          title="性別"
          type="text"
          data={this.props.detail["properties"]["性別"]}
        />
        <InfoDiv
          title="体長"
          type="number"
          data={this.props.detail["properties"]["体長"]}
          unit="cm"
        />
        <InfoDiv
          title="体重 (体長から自動計算)"
          type="number"
          data={this.props.detail["properties"]["体重"]}
          unit="kg"
        />
        <InfoDiv
          title="備考"
          type="longText"
          data={this.props.detail["properties"]["備考"]}
        />
      </div>
    );
  }
}

export default BoarInfo;
