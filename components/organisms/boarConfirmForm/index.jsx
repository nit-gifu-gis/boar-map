import "./boarConfirmForm.scss";

import dynamic from "next/dynamic";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";
import "../../../utils/statics";

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

  componentDidMount() {
    if (Router.query.lng != undefined) {
      this.setState({
        lng: Router.query.lng,
        lat: Router.query.lat,
        division: Router.query.division,
        date: Router.query.date,
        trapOrEnv: Router.query.trapOrEnv,
        sex: Router.query.sex,
        length: Router.query.length,
        weight: Router.query.weight
      });
    } else {
      Router.push("/map");
    }
  }

  submitInfo() {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: BOAR_LAYER_ID,
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
            区分: this.state.division,
            捕獲年月日: this.state.date,
            位置情報: "(" + this.state.lat + "," + this.state.lng + ")",
            "罠・発見場所": this.state.trapOrEnv,
            性別: this.state.sex,
            体長: this.state.length,
            体重: this.state.weight
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
      pathname: "/add/info/boar",
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
    if (this.state.lng != undefined) {
      return (
        <div className="boar_confirm_form">
          <div className="__title">
            <h1>捕獲情報登録</h1>
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
            <div className="__division">
              <h3>区分</h3>
              <p>{this.state.division}</p>
            </div>
            <div className="__date">
              <h3>捕獲年月日</h3>
              <p>{this.state.date}</p>
            </div>
            <div className="__trap_or_env">
              <h3>わな・発見場所</h3>
              <p>{this.state.trapOrEnv}</p>
            </div>
            <div className="__sex">
              <h3>性別</h3>
              <p>{this.state.sex}</p>
            </div>
            <div className="__length">
              <h3>体長</h3>
              <p>{this.state.length}cm</p>
            </div>
            <div className="__weight">
              <h3>体重</h3>
              <p>{this.state.weight}kg (体長から自動計算)</p>
            </div>
          </div>
          <AddInfoFooter
            prevBind={this.onClickPrev.bind(this)}
            nextBind={this.onClickNext.bind(this)}
          />
        </div>
      );
    } else {
      return (
        <div className="boar_confirm_form">
          <h1>情報取得中</h1>
        </div>
      );
    }
  }
}

export default BoarConfirmForm;
