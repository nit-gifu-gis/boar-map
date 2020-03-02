import "./addLocation.scss";

import React from "react";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import Router from "next/router";
import RoundButton from "../../atomos/roundButton";
import MapForAddInfo from "../../organisms/mapForAddInfo";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapForAddInfo"),
  {
    ssr: false
  }
);

class AddLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 35.367237,
      lng: 136.637408
    };
    this.saveCenter.bind(this);
  }

  onClickPrev() {
    Router.push("/add/select");
  }

  onClickNext() {
    const url = "/add/info/" + Router.query.type;
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng
        }
      },
      url
    );
  }

  // マップ中心を記録する
  // 子コンポーネントから呼ばれる
  saveCenter(center) {
    this.setState({ lat: center.lat, lng: center.lng });
  }

  render() {
    // ヘッダーの色を決定
    let header = <Header color="primary">位置情報登録</Header>;
    switch (Router.query.type) {
      case "boar":
        header = <Header color="boar">捕獲情報登録</Header>;
        break;
      case "trap":
        header = <Header color="trap">わな情報登録</Header>;
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報登録</Header>;
        break;
      default:
        break;
    }
    return (
      <div className="add-location">
        {header}
        <DynamicMapComponentWithNoSSR
          saveCenterMethod={center => this.saveCenter(center)}
        />
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev}>
            ＜ 戻る
          </RoundButton>
          <RoundButton color="primary" bind={this.onClickNext.bind(this)}>
            進む ＞
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default AddLocation;
