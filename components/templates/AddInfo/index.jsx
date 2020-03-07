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
      data: null
    };
  }

  componentDidMount() {
    if (
      Router.query.lat != undefined &&
      Router.query.lng != undefined &&
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

  onClickNext() {
    window.alert("工事中");
  }

  render() {
    const header = <Header color="primary">情報登録</Header>;
    return (
      <div className="add-info">
        {header}
        <div className="form-div">
          {/* ここにform */}
          <p>lat: {this.state.lat}</p>
          <p>lng: {this.state.lng}</p>
          <p>type: {this.state.type}</p>
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
