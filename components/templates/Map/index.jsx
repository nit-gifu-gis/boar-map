import "./map.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import AddInformationButton from "../../atomos/addInformationButton";
import Link from "next/link";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapBase"),
  {
    ssr: false
  }
);

const Map = () => (
  <div>
    <Header color="boar">マップ</Header>
    <DynamicMapComponentWithNoSSR />
  </div>
);

export default Map;
