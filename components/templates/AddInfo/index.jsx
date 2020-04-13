import "./addInfo.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import FooterAdjustment from "../../organisms/footerAdjustment";
import RoundButton from "../../atomos/roundButton";

import BoarForm from "../../organisms/boarForm";
import TrapForm from "../../organisms/trapForm";
import VaccineForm from "../../organisms/vaccineForm";
import Router from "next/router";

class AddInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: null,
      lng: null,
      type: null,
      detail: null
    };
    this.formRef = React.createRef();
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
  }

  onClickPrev() {
    const url = "/add/location";
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.state.lat,
          lng: this.state.lng,
          type: Router.query.type
        }
      },
      url
    );
  }

  // formから情報を取得して次のページに遷移する
  // 本当はrefを使うやり方はあまりよろしくないらしいので要リファクタリング
  // 各formもインターフェース作って継承させないかんな…
  onClickNext() {
    const data = this.formRef.current.createData();
    // console.log(this.state);
    // console.log(data);
    const url = "/add/confirm";
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
    // window.alert("工事中");
  }

  render() {
    // ヘッダーの色を決定
    let header = <Header color="primary">位置情報登録</Header>;
    let form = <h1>情報取得中...</h1>;
    switch (this.state.type) {
      case "boar":
        header = <Header color="boar">捕獲情報登録</Header>;
        form = <BoarForm ref={this.formRef} />;
        break;
      case "trap":
        header = <Header color="trap">わな情報登録</Header>;
        form = <TrapForm ref={this.formRef} />;
        break;
      case "vaccine":
        header = <Header color="vaccine">ワクチン情報登録</Header>;
        form = <VaccineForm ref={this.formRef} />;
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
          <RoundButton color="primary" bind={this.onClickNext.bind(this)}>
            進む ＞
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default AddInfo;
