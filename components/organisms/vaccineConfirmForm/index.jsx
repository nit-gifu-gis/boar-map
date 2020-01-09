import "./vaccineConfirmForm.scss";

import dynamic from "next/dynamic";
import Router from "next/router";
import React from "react";
import AddInfoFooter from "../../molecules/addInfoFooter";

const DynamicMapComponentWithNoSSR = dynamic(() => import("../miniMap"), {
  ssr: false
});

const RecoverInfoDiv = props => (
  <div className="__recover_info">
    <div className="__recover_date">
      <h3>回収年月日</h3>
      <p>{props.me.state.recoverDate}</p>
    </div>
    <div className="__eaten">
      <h3>摂食の有無</h3>
      <p>{props.me.state.eaten}</p>
    </div>
    <div className="__damage">
      <h3>その他の損傷</h3>
      <p>{props.me.state.damage}</p>
    </div>
  </div>
);

class VaccineConfirmForm extends React.Component {
  state = {
    userData: undefined,
    recoverInfoDiv: null,
    recover: ""
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
    if (Router.query.lat != undefined && Router.query.lng != undefined) {
      this.setState({
        id: Router.query.id,
        lat: Router.query.lat,
        lng: Router.query.lng,
        meshNumber: Router.query.meshNumber,
        treatDate: Router.query.treatDate,
        recoverDate: Router.query.recoverDate,
        eaten: Router.query.eaten,
        damage: Router.query.damage,
        note: Router.query.note,
        recover: Router.query.recover
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
      layerId: 5000010,
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
            位置情報: "(" + this.state.lat + "," + this.state.lng + ")",
            メッシュ番号: this.state.meshNumber,
            散布年月日: this.state.treatDate,
            散布数: this.state.treatNumber,
            回収年月日: this.state.recoverDate,
            摂食の有無: this.state.eaten,
            その他破損: this.state.damage,
            備考: this.state.note
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
      pathname: "/add/info/vaccine",
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
      // 回収済みなら回収情報を表示
      if (this.state.recover.toLowerCase() === "true") {
        this.state.recoverInfoDiv = <RecoverInfoDiv me={this} />;
      }
      return (
        <div className="vaccine_confirm_form">
          <div className="__title">
            <h1>ワクチン情報登録</h1>
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
            <div className="__mesh_number">
              <h3>メッシュ番号</h3>
              <p>{this.state.meshNumber}</p>
            </div>
            <div className="__treat_date">
              <h3>散布年月日</h3>
              <p>{this.state.treatDate}</p>
            </div>
            <div className="__treat_number">
              <h3>散布数</h3>
              <p>{this.state.treatNumber}</p>
            </div>
            {this.state.recoverInfoDiv}
            <div className="__note">
              <h3>備考</h3>
              <p>
                {/* Todo: 改行されないのを修正 */}
                {this.state.note}
              </p>
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
        <div className="vaccine_confirm_form">
          <h1>情報取得中</h1>
        </div>
      );
    }
  }
}

export default VaccineConfirmForm;
