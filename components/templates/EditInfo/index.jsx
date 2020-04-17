import "./editInfo.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import FooterAdjustment from "../../organisms/footerAdjustment";
import RoundButton from "../../atomos/roundButton";

import BoarForm from "../../organisms/boarForm";
import TrapForm from "../../organisms/trapForm";
import VaccineForm from "../../organisms/vaccineForm";
import Router from "next/router";

import ImageInput from "../../organisms/imageInput";

class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      detail: null,
      id: null,
      lat: null,
      lng: null,
      ids: []
    };
    this.formRef = React.createRef();
  }

  fileChanged(data) {
    this.state.formData = data;
  }

  upload() {
    const data = this.formRef.current.createDetail();
    // 編集時はIDを付け足す
    data["properties"]["ID$"] = this.state.id;
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

  callback(data, res, error) {
    const url = "/edit/confirm";
    Router.push(
      {
        pathname: url,
        query: {
          type: this.state.type,
          detail: JSON.stringify(data),
          ids: this.state.ids,
          formData: JSON.stringify(res)
        }
      },
      url
    );
  }

  componentDidMount() {
    if (Router.query.type != undefined || Router.query.detail != undefined) {
      const detail = JSON.parse(Router.query.detail);
      this.setState({
        type: Router.query.type,
        detail: detail,
        id: detail["properties"]["ID$"],
        lat: detail["geometry"]["coordinates"][1],
        lng: detail["geometry"]["coordinates"][0],
        ids: Router.query.ids
      });
    } else {
      alert("情報の取得に失敗しました。\nもう一度やり直してください。");
      Router.push("/map");
    }
    // console.log(Router.query.detail);
  }

  onClickPrev() {
    // const data = this.formRef.current.createDetail();
    const url = "/detail";
    const typeStr = this.state.type;
    let type = null;
    switch (typeStr) {
      case "boar":
        type = 0;
        break;
      case "trap":
        type = 1;
        break;
      case "vaccine":
        type = 2;
        break;
      default:
        console.log("err");
        break;
    }
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
  onClickNext() {
    this.upload();
    // console.log(this.state.id);
    // console.log(data);

    // window.alert("工事中");
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
          <div className="pic-form">
            <ImageInput
              type={this.state.type}
              onChanged={this.fileChanged.bind(this)}
            />
          </div>
          <FooterAdjustment />
        </div>
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev.bind(this)}>
            ＜ 戻る
          </RoundButton>
          <RoundButton color="primary" bind={this.onClickNext.bind(this)}>
            進む ＞
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default EditInfo;
