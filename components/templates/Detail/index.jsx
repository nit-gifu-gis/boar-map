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
import UserData from "../../../utils/userData";

class Detail extends React.Component {
  state = {
    detail: undefined,
    retry: 0,
    type: undefined,
    imageIDs: [],
    userData: UserData.getUserData()
  };
  async getFeatureDetail() {
    if (Router.query.type == undefined) {
      Router.push("/map");
      return;
    }

    // W,K以外でワクチン情報を表示しようとするのは禁止
    if (
      this.state.userData.department != "W" &&
      this.state.userData.department != "K"
    ) {
      if (Router.query.type == "2") {
        console.log("Permission Denied: ワクチン情報にはアクセスできません");
        return;
      }
    }

    const data = {
      layerId: BOAR_LAYER_ID + parseInt(Router.query.type),
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
      const typeNum = Router.query.type;
      // console.log(typeNum);
      let type = "";
      if (typeNum == 0) {
        type = "boar";
      } else if (typeNum == 1) {
        type = "trap";
      } else if (typeNum == 2) {
        type = "vaccine";
      }
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
      const layerId = BOAR_LAYER_ID + parseInt(Router.query.type);
      // GISにフェッチ
      const body = {
        layerId: layerId,
        shapeIds: [id]
      };
      try {
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

    if (this.state.detail && this.state.userData) {
      // ユーザーIDが入力者なら編集を有効化
      const editEnabled =
        this.state.detail["properties"]["入力者"] ===
          this.state.userData.user_id || this.state.userData.department === "K";

      if (Object.keys(this.state.detail).length != 0) {
        const type = Router.query.type;
        if (type == 0) {
          this.state.type = "boar";
          header = <Header color="boar">捕獲情報</Header>;
          detaildiv = <BoarInfo detail={this.state.detail} imageIDs={imgIds} />;
        } else if (type == 1) {
          this.state.type = "trap";
          header = <Header color="trap">わな情報</Header>;
          detaildiv = <TrapInfo detail={this.state.detail} imageIDs={imgIds} />;
        } else if (type == 2) {
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
