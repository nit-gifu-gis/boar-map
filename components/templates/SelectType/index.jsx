import "./selectType.scss";

import React from "react";
import Router from "next/router";
import Header from "../../organisms/header";
import InfoTypeSelector from "../../organisms/infoTypeSelector";
import Footer from "../../organisms/footer";
import RoundButton from "../../atomos/roundButton";
import FooterAdjustment from "../../organisms/footerAdjustment";

import { alert } from "../../../utils/modals";
class SelectType extends React.Component {
  constructor(props) {
    super(props);
  }

  // 前へボタンを押したときの処理
  onClickPrev() {
    Router.push("/map");
  }

  async onClickNext() {
    // なんでこれで動くのか，JavaScriptの知識が足りないためわからない・・・
    const selector = new InfoTypeSelector();
    const selectedItem = selector.getSelectedItem();
    console.log("parent", selectedItem);
    if (selectedItem == null) {
      await alert("登録する情報の種類が選択されていません!!");
      return;
    }
    // チェックが有る場合
    const url = "/add/location";
    switch (selectedItem) {
      case "boar":
      case "vaccine":
      case "trap":
        break;
      default:
        await alert("登録する情報の種類が選択されていません!!");
        return;
    }
    Router.push({ pathname: url, query: { type: selectedItem } }, url);
  }

  render() {
    return (
      <div className="select-type">
        <Header color="primary">情報登録</Header>
        <div className="selector">
          <InfoTypeSelector />
          <FooterAdjustment />
        </div>
        <Footer>
          <RoundButton color="accent" bind={this.onClickPrev}>
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

export default SelectType;
