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
    detail: {},
    retry: 0,
    type: undefined,
    ids: [],
    userDepartment: UserData.getUserDepartment()
  };
  async getFeatureDetail() {
    this.state.retry++;
    if (Router.query.type == undefined) {
      Router.push("/map");
      return;
    }
    const userData = UserData.getUserData();

    // W,K以外でワクチン情報を表示しようとするのは禁止
    if (this.state.userDepartment != "W" && this.state.userDepartment != "K") {
      if (Router.query.type == "2") {
        console.errer("Permission Denied: ワクチン情報にはアクセスできません");
        return;
      }
    }

    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: BOAR_LAYER_ID + parseInt(Router.query.type),
      shapeIds: [Router.query.FeatureID],
      srid: 3857
    };

    fetch("/api/JsonService.asmx/GetFeaturesById", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Map-Api-Access-Token": userData.access_token
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        res
          .json()
          .then(rdata => {
            this.state.retry = 0;
            if (rdata["data"]["features"].length != 0) {
              const feature = rdata["data"]["features"][0];
              let ids = feature["properties"]["画像ID"].split(",");
              if (ids.length == 1 && ids[0] === "") {
                ids = [];
              }
              console.log(ids);
              this.setState({
                detail: feature,
                ids: ids
              });
            }
          })
          .catch(e => {
            if (this.state.retry <= 5) {
              this.getFeatureDetail();
              console.log("retry");
            }
          });
      })
      .catch(e => {
        if (this.state.retry <= 5) {
          this.getFeatureDetail();
          console.log("retry");
        } else {
          this.state.retry = 0;
          console.log(e);
          alert("情報の取得に失敗しました。");
        }
      });
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
            ids: JSON.stringify(this.state.ids)
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

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">詳細情報</Header>;

    const imgIds = this.state.ids;
    if (Object.keys(this.state.detail).length != 0) {
      const type = Router.query.type;
      if (type == 0) {
        this.state.type = "boar";
        header = <Header color="boar">捕獲情報</Header>;
        detaildiv = <BoarInfo detail={this.state.detail} imgs={imgIds} />;
      } else if (type == 1) {
        this.state.type = "trap";
        header = <Header color="trap">わな情報</Header>;
        detaildiv = <TrapInfo detail={this.state.detail} imgs={imgIds} />;
      } else if (type == 2) {
        this.state.type = "vaccine";
        header = <Header color="vaccine">ワクチン情報</Header>;
        detaildiv = <VaccineInfo detail={this.state.detail} imgs={imgIds} />;
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
            ＜ 戻る
          </RoundButton>
          <RoundButton color="primary" bind={this.onClickNext.bind(this)}>
            編集 ＞
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default Detail;
