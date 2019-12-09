import "./boarConfirmForm.scss";

import dynamic from "next/dynamic";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

class BoarConfirmForm extends React.Component {
  state = {
    userData: undefined
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
  }

  submitInfo() {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: 5000008,
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
            区分: Router.query.division,
            捕獲年月日: Router.query.date,
            位置情報: "(" + Router.query.lat + "," + Router.query.lng + ")",
            "罠・発見場所": Router.query.trapOrEnv,
            性別: Router.query.sex,
            体長: Router.query.length,
            体重: Router.query.weight
          }
        }
      ]
    };

    console.log(data);

    fetch(
      "https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/AddFeatures",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(data)
      }
    )
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
      pathname: "/add/info/boar",
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
      <div className="boar_confirm_form">
        <div className="__title">
          <h1>捕獲いのしし情報</h1>
        </div>
        <div className="__location">
          <h3>場所</h3>
          <div className="__map_canvas">
            <DynamicMapComponentWithNoSSR
              lat={Router.query.lat}
              lng={Router.query.lng}
            />
          </div>
        </div>
        <div className="__info">
          <div className="__division">
            <h3>区分</h3>
            <p>{Router.query.division}</p>
          </div>
          <div className="__date">
            <h3>捕獲年月日</h3>
            <p>{Router.query.date}</p>
          </div>
          <div className="__trap_or_env">
            <h3>わな・発見場所</h3>
            <p>{Router.query.trapOrEnv}</p>
          </div>
          <div className="__sex">
            <h3>性別</h3>
            <p>{Router.query.sex}</p>
          </div>
          <div className="__length">
            <h3>体長</h3>
            <p>{Router.query.length}cm</p>
          </div>
          <div className="__weight">
            <h3>体重</h3>
            <p>{Router.query.weight}kg (体長から自動計算)</p>
          </div>
        </div>
        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default BoarConfirmForm;
