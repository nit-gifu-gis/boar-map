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
        detail: JSON.parse(Router.query.detail)
      });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }

    // 画像を読み込む
    const imageURLsStr = Router.query.objectURLs;
    if (imageURLsStr) {
      const urls = JSON.parse(imageURLsStr);
      // プレビュー用にobjectURLと枚数を保持
      this.setState({
        imageURLs: urls
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
    const userDepartment = this.state.userData.department;
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

      // GISに登録
      await this.postFeature(layerId, imageRes);

      // 登録後，objectURLを破棄する
      this.state.imageURLs.forEach(url => URL.revokeObjectURL(url));

      // mapに飛ばす
      alert("登録が完了しました。\nご協力ありがとうございました。");
      Router.push("/map");
    } catch (e) {
      console.error("アップロードエラー", e);
      alert(`登録に失敗しました。\n${e}`);
      this.setState({ isProcessing: false });
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
      const url = SERVER_URI + "/Image/AddImage?type=" + this.state.type;
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
          reject(json["reason"]);
        }
      } catch (e) {
        // 通信orデコード失敗
        reject(e);
      }
    });
  }

  // GISにpostする
  postFeature(layerId, imageRes) {
    return new Promise(async (resolve, reject) => {
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
        layerId: layerId,
        srid: 4326,
        features: [feature]
      };

      // post
      try {
        const res = await fetch(SERVER_URI + "/Feature/AddFeatures", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(data)
        });
        const json = await res.json();
        console.log(json);
        resolve();
      } catch (e) {
        reject(e);
      }
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
          detail: JSON.stringify(this.state.detail),
          objectURLs: JSON.stringify(this.state.imageURLs)
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
            <RoundButton color="danger" enabled={false}>
              処理中
            </RoundButton>
          )}
        </Footer>
      </div>
    );
  }
}

export default ConfirmInfo;
