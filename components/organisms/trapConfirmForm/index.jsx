import "./trapConfirmForm.scss";

import dynamic from "next/dynamic";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

const RemoveDateDiv = () => (
  <div className="__remove_date">
    <h3>撤去年月日</h3>
    <p>{Router.query.removeDate}</p>
  </div>
);

class TrapConfirmForm extends React.Component {
  state = {
    userData: undefined,
    removeDateDiv: null
  };

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
    if (Router.query.capture == "あり") {
      this.state.removeDateDiv = <RemoveDateDiv />;
    } else {
      this.state.removeDateDiv = null;
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
              parseFloat(Router.query.lng),
              parseFloat(Router.query.lat)
            ]
          },
          properties: {
            入力者: this.state.userData.user_id,
            設置年月日: Router.query.setDate,
            撤去年月日: Router.query.removeDate,
            位置情報: "(" + Router.query.lat + "," + Router.query.lng + ")",
            罠の種類: Router.query.kind,
            捕獲の有無: Router.query.capture
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
            Router.replace("/map");
          } else {
            console.log("Error:", data.commonHeader.systemErrorReport);
            alert("登録に失敗しました。");
          }
        });
      })
      .catch(error => console.log("Error:", error));
  }

  onClickPrev() {
    Router.replace({
      pathname: "/add/info/trap",
      query: { lat: Router.query.lat, lng: Router.query.lng }
    });
  }

  onClickNext() {
    const result = window.confirm("この内容でよろしいですか？");
    if (result) {
      this.submitInfo();
    }
  }

  render() {
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
                lat={Router.query.lat}
                lng={Router.query.lng}
              />
            </div>
          </div>
          <div className="__set_date">
            <h3>設置年月日</h3>
            <p>{Router.query.setDate}</p>
          </div>
          <div className="__kind">
            <h3>わなの種類</h3>
            <p>{Router.query.kind}</p>
          </div>
          <div className="__capture">
            <h3>捕獲の有無</h3>
            <p>{Router.query.capture}</p>
          </div>
          {this.state.removeDateDiv}
        </div>

        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default TrapConfirmForm;
