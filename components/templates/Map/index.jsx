import "./map.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";

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
    <Footer />
  </div>
);

export default Map;
