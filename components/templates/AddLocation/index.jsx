import "./addLocation.scss";

import React from "react";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import Router from "next/router";
import RoundButton from "../../atomos/roundButton";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapForAddInfo"),
  {
    ssr: false
  }
);

class AddLocation extends React.Component {
  constructor(props) {
    super(props);

    // もしCookieにlast_xxがあったら読み込む
    let defaultLat = 35.367237;
    let defautlLng = 136.637408;
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(value => {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "last_lat") {
          defaultLat = parseFloat(content[1]);
        } else if (content[0] == "last_lng") {
          defautlLng = parseFloat(content[1]);
        }
      });
    }

    this.state = {
      lat: defaultLat,
      lng: defautlLng,
      type: null,
      detail: null
    };
    this.saveCenter.bind(this);
  }

  componentDidMount() {
    if (Router.query.lat != null || Router.query.lng != null) {
      this.state.lat = Router.query.lat;
      this.state.lng = Router.query.lng;
    }
    // detailが設定されている場合は保存しておく（戻ってきた人用）
    if (Router.query.detail != null) {
      this.state.detail = Router.query.detail;
    }
    console.log(Router.query);
    if (Router.query.type != null) {
      this.setState({
        type: Router.query.type
      });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/add/select");
    }
  }

  onClickPrev() {
    Router.push("/add/select");
  }

  onClickNext() {
    // const url = "/add/info/" + Router.query.type;
    const url = "/add/info";
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng,
          type: this.state.type,
          detail: this.state.detail
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
    switch (this.state.type) {
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
          lat={this.state.lat}
          lng={this.state.lng}
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
