import "./detail.scss";
import Router from "next/router";

import OldBoarInfo from "../../organisms/oldBoarInfo";
import BoarInfo from "../../organisms/boarInfo";
import TrapInfo from "../../organisms/trapInfo";
import VaccineInfo from "../../organisms/vaccineInfo";

import "../../../utils/statics";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import RoundButton from "../../atomos/roundButton";
import FooterAdjustment from "../../organisms/footerAdjustment";
import {
  getLayerId,
  getUserData,
  hasReadPermission,
  SERVER_URI
} from "../../../utils/gis";

import { alert, confirm } from "../../../utils/modals";
import { hasTrader } from "../../../utils/jibie";

class Detail extends React.Component {
  state = {
    detail: undefined,
    retry: 0,
    type: undefined,
    imageIDs: [],
    imageIDkey: "画像ID",
    editEnabled: false,
    editEnabledLoaded: false
  };

  async getFeatureDetail() {
    if (Router.query.type == undefined) {
      Router.push("/map");
      return;
    }

    if (Router.query.type === "boar2") this.state.imageIDkey = "写真ID";

    // W,K以外でワクチン情報を表示しようとするのは禁止
    if (!hasReadPermission("vaccine")) {
      if (Router.query.type === "vaccine") {
        await alert("Permission Denied: ワクチン情報にはアクセスできません");
        return;
      }
    }

    const data = {
      layerId: getLayerId(Router.query.type),
      shapeIds: [Router.query.FeatureID],
      srid: 3857
    };

    const url =
      Router.query.type === "boar2"
        ? SERVER_URI + "/v2/GetFeaturesById"
        : SERVER_URI + "/Feature/GetFeaturesById";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(data)
      });
      const json = await res.json();
      const feature = json["features"][0];
      // TODO: Replace 処分方法
      for(let i = 0; i < feature["properties"]["捕獲いのしし情報"].length; i++) {
        const dt = feature["properties"]["捕獲いのしし情報"][i];
        console.log(dt);
        if(dt["処分方法"] === "利活用（ジビエ利用）") {
          feature["properties"]["捕獲いのしし情報"][i]["処分方法"] = "ジビエ業者渡し"
        } else if(dt["処分方法"] === "利活用（自家消費）") {
          feature["properties"]["捕獲いのしし情報"][i]["処分方法"] = "自家消費"
        }
      }
      const imageIDs =
        feature["properties"][this.state.imageIDkey] !== ""
          ? feature["properties"][this.state.imageIDkey].split(",")
          : [];
      this.setState({
        detail: feature,
        imageIDs: imageIDs
      });
    } catch (error) {
      console.log(error);
      await alert("情報の取得に失敗しました。");
    }
  }

  componentDidMount() {
    this.getFeatureDetail();
  }

  async onClickNext() {
    if (Object.keys(this.state.detail).length != 0) {
      console.log(JSON.stringify(this.state.detail));
      const type = Router.query.type;
      // console.log(type);
      const url = "/edit/info";
      Router.push(
        {
          pathname: url,
          query: {
            type: type,
            detail: JSON.stringify(this.state.detail),
            imageIDs: JSON.stringify(this.state.imageIDs)
          }
        },
        url
      );
    } else {
      await alert("情報取得中です");
    }
  }

  onClickPrev() {
    Router.push("/map");
  }

  async onClickDelete() {
    const res = await confirm("この情報を削除します。\n本当によろしいですか？");
    if (res) {
      // id取得
      const id = this.state.detail["properties"]["ID$"];
      const layerId = getLayerId(Router.query.type);
      // 画像を消す
      const deleteImageIds = this.state.detail["properties"][
        this.state.imageIDkey
      ].split(",");
      const deleteImage = id => {
        console.log(id);
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
      // GISにフェッチ
      const body = {
        layerId: layerId,
        shapeIds: [id]
      };
      try {
        // 先に画像を消す
        Promise.all(deleteImageIds.map(id => deleteImage(id)));
        const url =
          Router.query.type === "boar2"
            ? SERVER_URI + "/v2/DeleteFeatures.php"
            : SERVER_URI + "/Feature/DeleteFeatures.php";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(body)
        });
        if (res.status === 200) {
          const json = await res.json();
          console.log(json["status"]);
          await alert("削除しました。");
          Router.push("/map");
        } else {
          const json = await res.json();
          await alert(json["reason"]);
        }
      } catch (error) {
        await alert(error);
      }
    }
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">詳細情報</Header>;

    const imgIds = this.state.imageIDs;
    const userData = getUserData();

    if (this.state.detail && userData) {
      const type = Router.query.type;
      // ユーザーIDが入力者なら編集を有効化
      // - ジビエ利用の場合で、その業者が関係する場合も編集を有効
      // 旧レイヤーは編集を無効に。（削除は可能）
      const deleteEnabled =
        this.state.detail["properties"]["入力者"] === userData.userId ||
        userData.department === "K";

      if (!this.state.editEnabledLoaded) {
        const editEnabled =
          type !== "boar" &&
          (this.state.detail["properties"]["入力者"] === userData.userId ||
            userData.department === "K");

        if (userData.department === "J" && type === "boar2" && !editEnabled) {
          hasTrader(this.state.detail["properties"]["捕獲いのしし情報"]).then(
            result => {
              console.log(result);
              this.setState({
                editEnabled: result,
                editEnabledLoaded: true
              });
            }
          );
        } else {
          this.setState({
            editEnabled: editEnabled,
            editEnabledLoaded: true
          });
        }
      }

      if (Object.keys(this.state.detail).length != 0) {
        if (type == "boar2") {
          this.state.type = "boar2";
          header = <Header color="boar">捕獲情報</Header>;
          // 互換性保持のために一部項目を別キーに複製する.
          this.state.detail["properties"]["罠・発見場所"] = this.state.detail[
            "properties"
          ]["罠発見場所"];
          this.state.detail["properties"]["メッシュ番号"] = this.state.detail[
            "properties"
          ]["メッシュ番"];
          console.log(this.state.detail);
          detaildiv = <BoarInfo detail={this.state.detail} imageIDs={imgIds} />;
        } else if (type == "trap") {
          this.state.type = "trap";
          header = <Header color="trap">わな情報</Header>;
          detaildiv = <TrapInfo detail={this.state.detail} imageIDs={imgIds} />;
        } else if (type == "vaccine") {
          this.state.type = "vaccine";
          header = <Header color="vaccine">ワクチン情報</Header>;
          detaildiv = (
            <VaccineInfo detail={this.state.detail} imageIDs={imgIds} />
          );
        } else if (type == "boar") {
          this.state.type = "boar";
          header = <Header color="boar">捕獲情報</Header>;
          detaildiv = (
            <OldBoarInfo detail={this.state.detail} imageIDs={imgIds} />
          );
          // 旧いのしし情報表示用のやつをここに足す
        }
      }
      return (
        <div>
          {header}
          <div className="detail-div">
            {detaildiv}
            <FooterAdjustment />
          </div>
          <Footer>
            <RoundButton color="accent" bind={this.onClickPrev}>
              戻る
            </RoundButton>
            <RoundButton
              color="primary"
              bind={this.onClickNext.bind(this)}
              enabled={this.state.editEnabled}
            >
              編集
            </RoundButton>
            <RoundButton
              color="danger"
              bind={this.onClickDelete.bind(this)}
              enabled={deleteEnabled}
            >
              削除
            </RoundButton>
          </Footer>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default Detail;
