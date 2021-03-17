import "./editInfo.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import FooterAdjustment from "../../organisms/footerAdjustment";
import RoundButton from "../../atomos/roundButton";

import BoarForm from "../../organisms/boarForm";
import TrapForm from "../../organisms/trapForm";
import VaccineForm from "../../organisms/vaccineForm";
import Router from "next/router";

import { alert } from "../../../utils/modals";

// import ImageInput from "../../organisms/imageInput";

class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      detail: null,
      id: null,
      lat: null,
      lng: null,
      imageIDs: [],
      isProcessing: false,
      objectURLs: [],
      deletedIDs: []
    };
    this.formRef = React.createRef();
  }

  fileChanged(objectURLs) {
    this.state.objectURLs = objectURLs;
  }

  onDeletedServerImage(imageIDs, deletedID) {
    console.log(deletedID);
    this.state.imageIDs = imageIDs;
    this.state.deletedIDs.push(deletedID);
  }

  async componentDidMount() {
    if (Router.query.type != undefined || Router.query.detail != undefined) {
      const detail = JSON.parse(Router.query.detail);
      this.setState({
        type: Router.query.type,
        detail: detail,
        id: detail["properties"]["ID$"],
        lat: detail["geometry"]["coordinates"][1],
        lng: detail["geometry"]["coordinates"][0],
        imageIDs: JSON.parse(Router.query.imageIDs)
      });
    } else {
      await alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
    // console.log(Router.query.detail);
    // 戻ってきた人用，入力画像初期値
    const imageURLsStr = Router.query.objectURLs;
    console.log(imageURLsStr);
    if (imageURLsStr) {
      const urls = JSON.parse(imageURLsStr);
      this.setState({
        objectURLs: urls
      });
    }

    const deletedIDsStr = Router.query.deletedIDs;
    if (deletedIDsStr) {
      this.setState({ deletedIDs: JSON.parse(deletedIDsStr) });
    }
  }

  onClickPrev() {
    // const data = this.formRef.current.createDetail();
    const url = "/detail";
    const type = this.state.type;
    console.log(type);
    console.log(this.state.id);
    Router.push(
      {
        pathname: url,
        query: { type: type, FeatureID: this.state.id }
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
      if (data != null) {
        // 編集時はidを付け足す
        data["properties"]["ID$"] = this.state.id;
        this.setState({ isProcessing: true });
        const url = "/edit/confirm";
        Router.push(
          {
            pathname: url,
            query: {
              type: this.state.type,
              detail: JSON.stringify(data),
              imageIDs: JSON.stringify(this.state.imageIDs),
              objectURLs: JSON.stringify(this.state.objectURLs),
              deletedIDs: JSON.stringify(this.state.deletedIDs)
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
    let header = <Header color="primary">登録情報編集</Header>;
    let form = <h1>情報取得中...</h1>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報編集</Header>;
        form = (
          <BoarForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
            imageIDs={this.state.imageIDs}
            onDeleteServerImage={this.onDeletedServerImage.bind(this)}
          />
        );
        break;
      case "trap":
        header = <Header color="trap">わな情報編集</Header>;
        form = (
          <TrapForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
            imageIDs={this.state.imageIDs}
            onDeleteServerImage={this.onDeletedServerImage.bind(this)}
          />
        );
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報編集</Header>;
        form = (
          <VaccineForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
            objectURLs={this.state.objectURLs}
            imageIDs={this.state.imageIDs}
            onDeleteServerImage={this.onDeletedServerImage.bind(this)}
          />
        );
        break;
      default:
        break;
    }
    return (
      <div className="edit-info">
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

export default EditInfo;
