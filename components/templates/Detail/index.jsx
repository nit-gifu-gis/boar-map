import "./detail.scss";
import Router from "next/router";

import BoarInfo from "../../organisms/boarInfo";
import TrapInfo from "../../organisms/trapInfo";
import VaccineInfo from "../../organisms/vaccineInfo";

import "../../../utils/statics";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import RoundButton from "../../atomos/roundButton";
import FooterAdjustment from "../../organisms/footerAdjustment";
import { getLayerId, getUserData, hasReadPermission } from "../../../utils/gis";

class Detail extends React.Component {
  state = {
    detail: undefined,
    retry: 0,
    type: undefined,
    imageIDs: []
  };

  async getFeatureDetail() {
    if (Router.query.type == undefined) {
      Router.push("/map");
      return;
    }

    // W,K以外でワクチン情報を表示しようとするのは禁止
    if (!hasReadPermission("vaccine")) {
      if (Router.query.type === "vaccine") {
        console.log("Permission Denied: ワクチン情報にはアクセスできません");
        return;
      }
    }

    const data = {
      layerId: getLayerId(Router.query.type),
      shapeIds: [Router.query.FeatureID],
      srid: 3857
    };

    try {
      const res = await fetch(SERVER_URI + "/Feature/GetFeaturesById", {
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
      const imageIDs =
        feature["properties"]["画像ID"] !== ""
          ? feature["properties"]["画像ID"].split(",")
          : [];
      console.log(feature);
      this.setState({
        detail: feature,
        imageIDs: imageIDs
      });
    } catch (error) {
      console.log(error);
      alert("情報の取得に失敗しました。");
    }
  }

  componentDidMount() {
    this.getFeatureDetail();
  }

  onClickNext() {
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
      alert("情報取得中です");
    }
  }

  onClickPrev() {
    Router.push("/map");
  }

  async onClickDelete() {
    const res = confirm("この情報を削除します。\n本当によろしいですか？");
    if (res) {
      // id取得
      const id = this.state.detail["properties"]["ID$"];
      const layerId = getLayerId(Router.query.type);
      // 画像を消す
      const deleteImageIds = this.state.detail["properties"]["画像ID"].split(
        ","
      );
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
        const res = await fetch(SERVER_URI + "/Feature/DeleteFeatures.php", {
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
          alert("削除しました。");
          Router.push("/map");
        } else {
          const json = await res.json();
          alert(json["reason"]);
        }
      } catch (error) {
        alert(error);
      }
    }
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">詳細情報</Header>;

    const imgIds = this.state.imageIDs;
    const userData = getUserData();

    if (this.state.detail && userData) {
      // ユーザーIDが入力者なら編集を有効化
      const editEnabled =
        this.state.detail["properties"]["入力者"] === userData.userId ||
        userData.department === "K";

      if (Object.keys(this.state.detail).length != 0) {
        const type = Router.query.type;
        if (type == "boar") {
          this.state.type = "boar";
          header = <Header color="boar">捕獲情報</Header>;
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
              enabled={editEnabled}
            >
              編集
            </RoundButton>
            <RoundButton
              color="danger"
              bind={this.onClickDelete.bind(this)}
              enabled={editEnabled}
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
