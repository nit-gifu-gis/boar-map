import "./boarInfo.scss";
import React from "react";
import InfoDiv from "../../molecules/infoDiv";

class BoarInfo extends React.Component {
  render() {
    // 妊娠の状況は性別がメスの時のみ表示
    let pregnantInfo = null;
    if (this.props.detail["properties"]["性別"] === "メス") {
      pregnantInfo = (
        <InfoDiv
          title="妊娠の状況"
          type="text"
          data={this.props.detail["properties"]["妊娠の状況"]}
        />
      );
    }
    // 捕獲頭数は箱わなが選択された時のみ表示
    let catchNumInfo = null;
    if (this.props.detail["properties"]["罠・発見場所"] === "箱わな") {
      catchNumInfo = (
        <InfoDiv
          title="捕獲頭数"
          type="text"
          data={this.props.detail["properties"]["捕獲頭数"]}
        />
      );
    }
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
        {catchNumInfo}
        <InfoDiv
          title="幼獣・成獣の別"
          data={this.props.detail["properties"]["幼獣・成獣"]}
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
          title="体重 （体長から自動計算）"
          type="number"
          data={this.props.detail["properties"]["体重"]}
          unit="kg"
        />
        {pregnantInfo}
        <InfoDiv
          title="処分方法"
          type="text"
          data={this.props.detail["properties"]["処分方法"]}
        />
        <InfoDiv
          title="備考（遠沈管番号）"
          type="longText"
          data={this.props.detail["properties"]["備考"]}
        />
      </div>
    );
  }
}

export default BoarInfo;
