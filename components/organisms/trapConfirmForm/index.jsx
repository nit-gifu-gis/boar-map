import "./trapConfirmForm.scss";

import dynamic from "next/dynamic";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

const RemoveDateDiv = props => (
  <div className="__remove_date">
    <h3>撤去年月日</h3>
    <p>{props.me.state.removeDate}</p>
  </div>
);

class TrapConfirmForm extends React.Component {
  state = {
    userData: undefined,
    removeDateDiv: null
  };

  componentDidMount() {
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({
        kind: Router.query.kind,
        setDate: Router.query.setDate,
        removeDate: Router.query.removeDate,
        lat: Router.query.lat,
        lng: Router.query.lng,
        kind: Router.query.kind,
        capture: Router.query.capture,
        type: Router.query.type
      });
    } else {
      Router.push("/map");
    }
  }

  constructor() {
    super();
    // ユーザーデータ取得(cookieから持ってくる)
    const userData = { user_id: "", access_token: "" };
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(function(value) {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "user_id") {
          userData.user_id = content[1];
        } else if (content[0] == "access_token") {
          userData.access_token = content[1];
        }
      });
      this.state.userData = userData;
    } else {
      return;
    }
  }

  submitInfo() {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: 5000009,
      srid: 4326,
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(this.state.lng),
              parseFloat(this.state.lat)
            ]
          },
          properties: {
            入力者: this.state.userData.user_id,
            設置年月日: this.state.setDate,
            撤去年月日: this.state.removeDate,
            位置情報: "(" + this.state.lat + "," + this.state.lng + ")",
            罠の種類: this.state.kind,
            捕獲の有無: this.state.capture
          }
        }
      ]
    };

    console.log(data);

    fetch("/api/JsonService.asmx/AddFeatures", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Map-Api-Access-Token": token
      },
      body: JSON.stringify(data)
    })
      .then(function(res) {
        const json = res.json().then(data => {
          if (data.commonHeader.resultInfomation == "0") {
            alert("登録が完了しました。\nご協力ありがとうございました。");
            Router.push("/map");
          } else {
            console.log("Error:", data.commonHeader.systemErrorReport);
            alert("登録に失敗しました。");
          }
        });
      })
      .catch(error => console.log("Error:", error));
  }

  onClickPrev() {
    Router.push({
      pathname: "/add/info/trap",
      query: { lat: this.state.lat, lng: this.state.lng }
    });
  }

  onClickNext() {
    const result = window.confirm("この内容でよろしいですか？");
    if (result) {
      this.submitInfo();
    }
  }

  render() {
    if (this.state.lat != undefined && this.state.lng != undefined) {
      if (this.state.capture == "あり") {
        this.state.removeDateDiv = <RemoveDateDiv me={this} />;
      } else {
        this.state.removeDateDiv = null;
      }
      return (
        <div className="trap_confirm_form">
          <div className="__title">
            <h1>わな情報登録</h1>
          </div>
          <div className="__info">
            <div className="__location">
              <h3>場所</h3>
              <div className="__map_canvas">
                <DynamicMapComponentWithNoSSR
                  lat={this.state.lat}
                  lng={this.state.lng}
                />
              </div>
            </div>
            <div className="__set_date">
              <h3>設置年月日</h3>
              <p>{this.state.setDate}</p>
            </div>
            <div className="__kind">
              <h3>わなの種類</h3>
              <p>{this.state.kind}</p>
            </div>
            <div className="__capture">
              <h3>捕獲の有無</h3>
              <p>{this.state.capture}</p>
            </div>
            {this.state.removeDateDiv}
          </div>

          <AddInfoFooter
            prevBind={this.onClickPrev.bind(this)}
            nextBind={this.onClickNext.bind(this)}
          />
        </div>
      );
    } else {
      return (
        <div className="trap_confirm_form">
          <h1>情報取得中...</h1>
        </div>
      );
    }
  }
}

export default TrapConfirmForm;
