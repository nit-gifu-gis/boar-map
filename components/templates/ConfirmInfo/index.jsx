import "./confirmInfo.scss";
import "../../../public/static/css/global.scss";

import Router from "next/router";

import BoarInfo from "../../organisms/boarInfo";
import TrapInfo from "../../organisms/trapInfo";
import VaccineInfo from "../../organisms/vaccineInfo";

import "../../../utils/statics";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import RoundButton from "../../atomos/roundButton";
import FooterAdjustment from "../../organisms/footerAdjustment";
import UserData from "../../../utils/userData";

import "whatwg-fetch";

class ConfirmInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: null,
      lng: null,
      type: null,
      detail: null,
      formData: null,
      picCount: 0,
      isProcessing: false,
      userData: UserData.getUserData(),
      imageURLs: [],
      imageBlobs: []
    };
  }

  async componentDidMount() {
    if (
      Router.query.lat != undefined ||
      Router.query.lng != undefined ||
      Router.query.type != undefined ||
      Router.query.detail != undefined
    ) {
      console.log("confirm", Router.query);
      this.setState({
        lat: Router.query.lat,
        lng: Router.query.lng,
        type: Router.query.type,
        detail: JSON.parse(Router.query.detail),
        formData: JSON.parse(Router.query.formData)
        // picCount: JSON.parse(Router.query.formData).length
      });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }

    // 画像を読み込む
    const imageURLsStr = sessionStorage.getItem("boarImage");
    if (imageURLsStr) {
      const urls = JSON.parse(imageURLsStr);
      // プレビュー用にobjectURLと枚数を保持
      this.setState({
        imageURLs: urls,
        picCount: urls.length
      });
      // 送信用にblobを保持
      const blobs = [];
      for (let i = 0; i < urls.length; i++) {
        // このためにfetchのpolyfill入れました…（小声）
        const blob = await fetch(urls[i]).then(r => r.blob());
        blobs.push(blob);
      }
      this.setState({
        imageBlobs: blobs
      });
    }
  }

  async submitInfo() {
    this.setState({ isProcessing: true });
    const token = this.state.userData.access_token;
    const userDepartment = this.state.userData.department;
    const receiptNumber = Math.floor(Math.random() * 100000);
    let layerId = null;
    // レイヤーIDを選択すると同時に，書き込み権限をチェック
    switch (this.state.type) {
      case "boar":
        if (
          userDepartment != "T" &&
          userDepartment != "U" &&
          userDepartment != "S" &&
          userDepartment != "K"
        ) {
          console.log("Permission Denied: この情報にはアクセスできません");
          Router.push("/map");
          return;
        }
        layerId = BOAR_LAYER_ID;
        break;
      case "trap":
        if (
          userDepartment != "T" &&
          userDepartment != "U" &&
          userDepartment != "S" &&
          userDepartment != "K"
        ) {
          console.log("Permission Denied: この情報にはアクセスできません");
          Router.push("/map");
          return;
        }
        layerId = TRAP_LAYER_ID;
        break;
      case "vaccine":
        if (userDepartment != "W" && userDepartment != "K") {
          console.log("Permission Denied: この情報にはアクセスできません");
          Router.push("/map");
          return;
        }
        layerId = VACCINE_LAYER_ID;
        break;
      default:
        break;
    }

    try {
      // 画像をアップロード（画像idを取得）
      const imageRes = await this.uploadImages();
      console.log(imageRes);

      // 画像を公開
      await this.publishImages(imageRes);

      // GISに登録
      // 画像IDをデータに追加する
      const feature = this.state.detail;
      const reg_ids = [];
      for (let i = 0; i < imageRes.length; i++) {
        const data = imageRes[i];
        if (data["id"] !== "") {
          reg_ids.push(data["id"]);
        }
      }
      const send_ids = reg_ids.join(",");
      feature["properties"]["画像ID"] = send_ids;
      console.log("登録フィーチャ", feature);

      // 登録データ生成
      const data = {
        commonHeader: {
          receiptNumber: receiptNumber
        },
        layerId: layerId,
        srid: 4326,
        features: [feature]
      };

      // post
      const res = await fetch("/api/JsonService.asmx/AddFeatures", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.commonHeader.resultInfomation == "0") {
        alert("登録が完了しました。\nご協力ありがとうございました。");
        Router.push("/map");
      } else {
        console.log("Error:", json.commonHeader.systemErrorReport);
        alert("登録に失敗しました。");
      }
    } catch (e) {
      console.error("アップロードエラー", e);
    }
  }

  // 画像をアップロードする
  uploadImages() {
    return new Promise(async (resolve, reject) => {
      // 1枚も画像がなければ空の配列を返す
      if (this.state.imageBlobs.length === 0) {
        resolve([]);
      }
      // 1枚以上画像があれば，アップロード→idを返す
      const ids = [];
      // 送信用データ生成
      const body = new FormData();
      for (let i = 0; i < this.state.imageBlobs.length; i++) {
        body.append("files[]", this.state.imageBlobs[i]);
      }
      const url = IMAGE_SERVER_URI + "/upload.php?type=" + this.state.type;
      const req = {
        credentials: "include",
        method: "POST",
        body: body,
        header: {
          "Content-Type": "multipart/form-data"
        }
      };
      // 通信
      try {
        const r = await fetch(url, req);
        const json = await r.json();
        if (json["status"] == 200) {
          // 通信成功
          json["results"].forEach(element => {
            ids.push({ id: element["id"], error: 0 });
          });
          resolve(ids);
        } else {
          reject(json["message"]);
        }
      } catch (e) {
        // 通信orデコード失敗
        reject(e);
      }
    });
  }

  publishImages(imageRes) {
    return new Promise((resolve, reject) => {
      fetch(IMAGE_SERVER_URI + "/publish.php?type=" + this.state.type, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify(imageRes)
      })
        .then(resolve())
        .catch(e => reject(e));
    });
  }

  onClickPrev() {
    const url = "/add/info";
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng,
          type: this.state.type,
          detail: JSON.stringify(this.state.detail)
        }
      },
      url
    );
  }

  async onClickNext() {
    const result = window.confirm("この内容でよろしいですか？");
    if (result) {
      await this.submitInfo();
    }
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">捕獲情報登録</Header>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報登録</Header>;
        detaildiv = (
          <BoarInfo
            detail={this.state.detail}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
          />
        );
        break;
      case "trap":
        header = <Header color="trap">わな情報登録</Header>;
        detaildiv = (
          <TrapInfo
            detail={this.state.detail}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
          />
        );
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報登録</Header>;
        detaildiv = (
          <VaccineInfo
            detail={this.state.detail}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
          />
        );
        break;
      default:
        break;
    }
    return (
      <div className="confirm-info">
        {header}
        <div className="confirm-div">
          <div className="description">
            <p>情報に不備がないかご確認ください。</p>
          </div>
          {detaildiv}
          <FooterAdjustment />
        </div>
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev.bind(this)}>
            ＜ 戻る
          </RoundButton>
          {this.state.isProcessing == false ? (
            <RoundButton color="danger" bind={this.onClickNext.bind(this)}>
              登録 ＞
            </RoundButton>
          ) : (
            <RoundButton
              color="danger"
              bind={this.onClickNext.bind(this)}
              enabled={false}
            >
              処理中
            </RoundButton>
          )}
        </Footer>
      </div>
    );
  }
}

export default ConfirmInfo;
