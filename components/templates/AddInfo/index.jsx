import "./addInfo.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import FooterAdjustment from "../../organisms/footerAdjustment";
import RoundButton from "../../atomos/roundButton";

import BoarForm from "../../organisms/boarForm";
import TrapForm from "../../organisms/trapForm";
import VaccineForm from "../../organisms/vaccineForm";
import Router from "next/router";
import ImageInput from "../../organisms/imageInput";

class AddInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: null,
      lng: null,
      type: null,
      detail: null,
      formData: null,
      isProcessing: false
    };
    this.formRef = React.createRef();
  }

  fileChanged(data) {
    this.state.formData = data;
  }

  callback(data, res, error) {
    const url = "/add/confirm";
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng,
          type: this.state.type,
          detail: JSON.stringify(data),
          formData: JSON.stringify(res)
        }
      },
      url
    );
  }

  upload(data) {
    if (this.state.formData == null) {
      this.callback(data, [], null);
    }
    const res = [];

    fetch(IMAGE_SERVER_URI + "/upload.php?type=" + this.state.type, {
      credentials: "include",
      method: "POST",
      body: this.state.formData,
      header: {
        "Content-Type": "multipart/form-data"
      }
    }).then(response =>
      response.json().then(json => {
        if (json["status"] == 200) {
          json["results"].forEach(element => {
            res.push({
              id: element["id"],
              error: 0
            });
          });
          this.callback(data, res, null);
        } else {
          this.callback(data, [], json["message"]);
        }
      })
    );
  }

  componentDidMount() {
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
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
    // console.log(Router.query.detail);
    if (Router.query.detail != "") {
      this.setState({
        detail: JSON.parse(Router.query.detail)
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
          detail: JSON.stringify(data)
        }
      },
      url
    );
  }

  // formから情報を取得して次のページに遷移する
  // 本当はrefを使うやり方はあまりよろしくないらしいので要リファクタリング
  // 各formもインターフェース作って継承させないかんな…
  onClickNext() {
    const data = this.formRef.current.createDetail();
    if (data != null) {
      this.setState({ isProcessing: true });
      this.upload(data);
    } else {
      this.setState({ isProcessing: false });
    }
    // window.alert("工事中");
  }

  render() {
    // ヘッダーの色を決定
    let header = <Header color="primary">位置情報登録</Header>;
    let form = <h1>情報取得中...</h1>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報登録</Header>;
        form = (
          <BoarForm
            ref={this.formRef}
            detail={this.state.detail}
            lat={this.state.lat}
            lng={this.state.lng}
            onChangedImages={this.fileChanged.bind(this)}
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
