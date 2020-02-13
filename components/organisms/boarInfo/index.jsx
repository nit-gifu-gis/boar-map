import "./boarInfo.scss";
import React from "react";
import dynamic from "next/dynamic";
import InfoDiv from "../../molecules/infoDiv";
import InfoTitle from "../../atomos/infoTitle";
import InfoText from "../../atomos/infoText";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

class BoarInfo extends React.Component {
  render() {
    return (
      <div className="boar_info_form">
        {/* <div className="__title">
          <h1>捕獲情報</h1>
        </div> */}
        <div className="__info">
          <InfoDiv
            title="場所"
            type="location"
            data={{
              lat: this.props.detail["geometry"]["coordinates"][1],
              lng: this.props.detail["geometry"]["coordinates"][0]
            }}
          />
          {/* <div className="__location">
            <InfoTitle>場所</InfoTitle>
            <div className="__map_canvas">
              <DynamicMapComponentWithNoSSR
                lat={this.props.detail["geometry"]["coordinates"][1]}
                lng={this.props.detail["geometry"]["coordinates"][0]}
              />
            </div>
          </div> */}
          {/* <div className="__division"> */}
          <InfoDiv
            title="区分"
            data={this.props.detail["properties"]["区分"]}
          />
          {/* <h3>区分</h3> */}
          {/* <p>{this.props.detail["properties"]["区分"]}</p> */}
          {/* </div>
          <div className="__date"> */}
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
          {/* <h3>わな・発見場所</h3>
            <p>{this.props.detail["properties"]["罠・発見場所"]}</p> */}
          {/* </div> */}
          {/* <div className="__sex"> */}
          <InfoDiv
            title="性別"
            type="text"
            data={this.props.detail["properties"]["性別"]}
          />
          {/* <h3>性別</h3>
            <p>{this.props.detail["properties"]["性別"]}</p> */}
          {/* </div> */}
          {/* <div className="__length"> */}
          {/* <h3>体長</h3>
            <p>{this.props.detail["properties"]["体長"]}cm</p> */}
          <InfoDiv
            title="体長"
            type="number"
            data={this.props.detail["properties"]["体長"]}
            unit="cm"
          />
          {/* </div>
          <div className="__weight"> */}
          <InfoDiv
            title="体重 (体長から自動計算)"
            type="number"
            data={this.props.detail["properties"]["体重"]}
            unit="kg"
          />
          {/* <h3>体重</h3>
          <p>{this.props.detail["properties"]["体重"]}kg (体長から自動計算)</p> */}
          {/* </div> */}
        </div>
      </div>
    );
  }
}

export default BoarInfo;
