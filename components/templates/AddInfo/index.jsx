import "./addInfo.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import FooterAdjustment from "../../organisms/footerAdjustment";
import RoundButton from "../../atomos/roundButton";

import BoarForm from "../../organisms/boarForm";
import TrapForm from "../../organisms/trapForm";
import VaccineForm from "../../organisms/vaccineForm";
import Router from "next/router";

import { alert } from "../../../utils/modals";

class AddInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: null,
      lng: null,
      type: null,
      detail: null,
      isProcessing: false,
      objectURLs: []
    };
    this.formRef = React.createRef();
  }

  fileChanged(objectURLs) {
    this.state.objectURLs = objectURLs;
  }

  async componentDidMount() {
    if (
      Router.query.lat != undefined ||
      Router.query.lng != undefined ||
      Router.query.type != undefined
    ) {
      this.setState({
        lat: Router.query.lat,
        lng: Router.query.lng,
        type: Router.query.type
      });
    } else {
      await alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
    // console.log(Router.query.detail);
    if (Router.query.detail != "") {
      this.setState({
        detail: JSON.parse(Router.query.detail)
      });
    }

    const imageURLsStr = Router.query.objectURLs;
    console.log(imageURLsStr);
    if (imageURLsStr) {
      const urls = JSON.parse(imageURLsStr);
      this.setState({
        objectURLs: urls
      });
    }
  }

  onClickPrev() {
    const data = this.formRef.current.createDetail();
    const url = "/add/location";
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng,
          type: this.state.type,
          detail: JSON.stringify(data),
          objectURLs: JSON.stringify(this.state.objectURLs)
        }
      },
      url
    );
  }

  // formから情報を取得して次のページに遷移する
  // 本当はrefを使うやり方はあまりよろしくないらしいので要リファクタリング
  // 各formもインターフェース作って継承させないかんな…
  async onClickNext() {
    // バリデーションをチェック
    if (await this.formRef.current.validateDetail()) {
      const data = this.formRef.current.createDetail();
      console.log(data);
      if (data != null) {
        this.setState({ isProcessing: true });
        const url = "/add/confirm";
        Router.push(
          {
            pathname: url,
            query: {
              lat: this.state.lat,
              lng: this.state.lng,
              type: this.state.type,
              detail: JSON.stringify(data),
              objectURLs: JSON.stringify(this.state.objectURLs)
            }
          },
          url
        );
      } else {
        this.setState({ isProcessing: false });
      }
    } else {
      await alert("入力内容にエラーがあります。ご確認ください。");
      this.setState({ isProcessing: false });
    }
  }

  render() {
    // ヘッダーの色を決定
    let header = <Header color="primary">位置情報登録</Header>;
    let form = <h1>情報取得中...</h1>;
    console.log(`Form Type: ${this.state.type}`);
    switch (this.state.type) {
      case "boar2":
        header = <Header color="boar">捕獲情報登録</Header>;
        form = (
          <BoarForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
          />
        );
        break;
      case "trap":
        header = <Header color="trap">わな情報登録</Header>;
        form = (
          <TrapForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
          />
        );
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報登録</Header>;
        form = (
          <VaccineForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
          />
        );
        break;
      default:
        break;
    }
    return (
      <div className="add-info">
        {header}
        <div className="form-div">
          <div className="description">
            <p>各情報を入力してください。</p>
          </div>
          {form}
          <FooterAdjustment />
        </div>
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev.bind(this)}>
            ＜ 戻る
          </RoundButton>
          {this.state.isProcessing == false ? (
            <RoundButton color="primary" bind={this.onClickNext.bind(this)}>
              進む ＞
            </RoundButton>
          ) : (
            <RoundButton
              color="primary"
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

export default AddInfo;
