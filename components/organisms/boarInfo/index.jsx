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
        <InfoDiv title="区分" data={this.props.detail["properties"]["区分"]} />
        <InfoDiv
          title="捕獲年月日"
          type="date"
          data={this.props.detail["properties"]["捕獲年月日"]}
        />
        {/* <h3>捕獲年月日</h3>
            <p>{this.props.detail["properties"]["捕獲年月日"]}</p> */}
        {/* </div>
          <div className="__trap_or_env"> */}
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
      </div>
    );
  }
}

export default BoarInfo;
