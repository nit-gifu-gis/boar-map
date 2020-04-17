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

class ConfirmEditedInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      detail: null,
      ids: null,
      formData: null,
      picCount: 0
    };
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
    if (Router.query.type != undefined || Router.query.detail != undefined) {
      // console.log("confirm", Router.query);
      this.setState({
        type: Router.query.type,
        detail: JSON.parse(Router.query.detail),
        ids: JSON.parse(Router.query.ids),
        formData: JSON.parse(Router.query.formData),
        picCount: JSON.parse(Router.query.formData).length
      });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
  }

  submitInfo() {
    const token = this.state.userData.access_token;
    const receiptNumber = Math.floor(Math.random() * 100000);
    let layerId = null;
    switch (this.state.type) {
      case "boar":
        layerId = BOAR_LAYER_ID;
        break;
      case "trap":
        layerId = TRAP_LAYER_ID;
        break;
      case "vaccine":
        layerId = VACCINE_LAYER_ID;
        break;
      default:
        break;
    }

    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: layerId,
      srid: 4326,
      features: [this.state.detail]
    };

    console.log(data);

    //
    // TODO: DBへの登録処理
    //

    console.log(this.state.formData);
    console.log(this.state.ids);

    fetch(IMAGE_SERVER_URI + "/publish.php?type=" + this.state.type, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify(this.state.formData)
    })
      .then(res => {
        fetch("/api/JsonService.asmx/UpdateFeatures", {
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
                alert("更新が完了しました。\nご協力ありがとうございました。");
                Router.push("/map");
              } else {
                console.log("Error:", data.commonHeader.systemErrorReport);
                alert("更新に失敗しました。");
              }
            });
          })
          .catch(error => console.log("Error:", error));
      })
      .catch(error => {
        console.log(error);
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
          detail: JSON.stringify(this.state.detail)
        }
      },
      url
    );
  }

  onClickNext() {
    const result = window.confirm("この内容でよろしいですか？");
    if (result) {
      this.submitInfo();
    }
  }

  render() {
    let detaildiv = <h1>情報取得中...</h1>;
    let header = <Header color="primary">捕獲情報編集</Header>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報編集</Header>;
        detaildiv = <BoarInfo detail={this.state.detail} />;
        break;
      case "trap":
        header = <Header color="trap">わな情報編集</Header>;
        detaildiv = <TrapInfo detail={this.state.detail} />;
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報編集</Header>;
        detaildiv = <VaccineInfo detail={this.state.detail} />;
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
          <div className="fileCount">
            <p>{this.state.picCount}枚の画像がアップロードされました。</p>
          </div>
          <FooterAdjustment />
        </div>
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev.bind(this)}>
            ＜ 戻る
          </RoundButton>
          <RoundButton color="danger" bind={this.onClickNext.bind(this)}>
            登録 ＞
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default ConfirmEditedInfo;
