import "./map.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import RoundButton from "../../atomos/roundButton";
import AddInformationButton from "../../atomos/addInformationButton";
import Link from "next/link";
import Router from "next/router";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapBase"),
  {
    ssr: false
  }
);

// 文字化け回避の文字列だよ
class Map extends React.Component {
  onClickAddInformationButton() {
    Router.push("/add/select");
  }

  render() {
    return (
      <div>
        <Header color="primary">マップ</Header>
        <DynamicMapComponentWithNoSSR isMainMap={true} />
        <Footer>
          <RoundButton
            color="primary"
            bind={this.onClickAddInformationButton.bind(this)}
          >
            新規情報登録
          </RoundButton>
        </Footer>
      </div>
    );
  }
}

export default Map;
