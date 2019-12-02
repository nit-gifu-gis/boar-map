import "./map.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import LinkButton from "../../atomos/linkButton";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapBase"),
  {
    ssr: false
  }
);

const Map = () => (
  <div>
    <Header />
    <h1>Map</h1>
    <DynamicMapComponentWithNoSSR />
    <LinkButton link="/add/select" title="新規情報登録" />
    <Footer />
  </div>
);

export default Map;
