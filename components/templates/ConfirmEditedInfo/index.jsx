import "./confirmEditedInfo.scss";
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
import { getLayerId, hasWritePermission, SERVER_URI } from "../../../utils/gis";

import { alert, confirm } from "../../../utils/modals";

import "whatwg-fetch";

class ConfirmEditedInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      detail: null,
      imageIDs: [],
      isProcessing: false,
      imageURLs: [],
      imageBlobs: [],
      deletedIDs: []
    };
  }

  async componentDidMount() {
    if (Router.query.type != undefined || Router.query.detail != undefined) {
      this.setState({
        type: Router.query.type,
        detail: JSON.parse(Router.query.detail),
        imageIDs: JSON.parse(Router.query.imageIDs),
        deletedIDs: JSON.parse(Router.query.deletedIDs)
      });
    } else {
      await alert("情報の取得に失敗しました。\nもう一度やり直してください。");
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
    // レイヤーIDを選択すると同時に，書き込み権限をチェック
    if (
      this.state.type != "boar" &&
      this.state.type != "trap" &&
      this.state.type != "vaccine"
    ) {
      // このif文は型定義がちゃんとしたら不要
      await alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
      return;
    }
    if (!hasWritePermission(this.state.type)) {
      await alert("Permission Denied: この情報にはアクセスできません");
      Router.push("/map");
      return;
    }
    const layerId = getLayerId(this.state.type);

    try {
      // 画像をアップロード（画像idを取得）
      const imageRes = await this.uploadImages();
      console.log(imageRes);

      // 消えた画像を消す
      await this.deleteImages();

      // GISに登録
      await this.postFeature(layerId, imageRes);

      // 登録後，objectURLを破棄する
      this.state.imageURLs.forEach(url => URL.revokeObjectURL(url));

      // mapに飛ばす
      await alert("登録が完了しました。\nご協力ありがとうございました。");
      Router.push("/map");
    } catch (e) {
      console.error("アップロードエラー", e);
      await alert(`登録に失敗しました。\n${e}`);
      this.setState({ isProcessing: false });
    }
  }

  // 画像をアップロードする
  uploadImages() {
    return new Promise(async (resolve, reject) => {
      // 1枚も画像がなければ空の配列を返す
      if (this.state.imageBlobs.length === 0) {
        resolve([]);
        return;
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

  // 消された画像をサーバーからも消す
  deleteImages() {
    // TODO
    console.log("削除画像", this.state.deletedIDs);
    // 一枚ずつ消す
    const deleteImage = id => {
      return new Promise(async (resolve, reject) => {
        try {
          const data = new FormData();
          data.append("id", id);
          const options = {
            credentials: "include",
            method: "POST",
            body: data,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded"
            }
          };
          delete options.headers["Content-Type"];
          const res = await fetch(
            `${SERVER_URI}/Image/DeleteImage.php`,
            options
          );
          const json = await res.json();
          console.log("deleteImage", json);
          if (res.status === 200) {
            resolve();
          } else {
            reject(json["reason"]);
          }
        } catch (e) {
          reject(e);
        }
      });
    };
    return Promise.all(this.state.deletedIDs.map(id => deleteImage(id)));
  }

  // GISにpostする
  postFeature(layerId, imageRes) {
    return new Promise(async (resolve, reject) => {
      // 画像IDをデータに追加する
      const feature = this.state.detail;
      const reg_ids = [].concat(this.state.imageIDs);
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
        const res = await fetch(SERVER_URI + "/Feature/UpdateFeatures", {
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
        if (res.status === 200) {
          resolve();
        } else {
          reject(json["reason"]);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  onClickPrev() {
    const url = "/edit/info";
    Router.push(
      {
        pathname: url,
        query: {
          id: this.state.detail["properties"]["ID$"],
          type: this.state.type,
          detail: JSON.stringify(this.state.detail),
          imageIDs: JSON.stringify(this.state.imageIDs),
          objectURLs: JSON.stringify(this.state.imageURLs),
          deletedIDs: JSON.stringify(this.state.deletedIDs)
        }
      },
      url
    );
  }

  async onClickNext() {
    const result = await confirm("この内容でよろしいですか？");
    if (result) {
      await this.submitInfo();
    }
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">捕獲情報編集</Header>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報編集</Header>;
        detaildiv = (
          <BoarInfo
            detail={this.state.detail}
            // waitingPublish={this.state.picCount}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
            imageIDs={this.state.imageIDs}
          />
        );
        break;
      case "trap":
        header = <Header color="trap">わな情報編集</Header>;
        detaildiv = (
          <TrapInfo
            detail={this.state.detail}
            // waitingPublish={this.state.picCount}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
            imageIDs={this.state.imageIDs}
          />
        );
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報編集</Header>;
        detaildiv = (
          <VaccineInfo
            detail={this.state.detail}
            // waitingPublish={this.state.picCount}
            confirmMode={true}
            objectURLs={this.state.imageURLs}
            imageIDs={this.state.imageIDs}
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

export default ConfirmEditedInfo;
