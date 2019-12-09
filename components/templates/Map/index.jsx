import "./map.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import AddInformationButton from "../../atomos/addInformationButton";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapBase"),
  {
    ssr: false
  }
);

const Map = () => (
  <div>
    <DynamicMapComponentWithNoSSR />
    <div class="footer-nav">
      <i class="fa fa-map">
        <p class="label__map">マップ</p>
      </i>
      <AddInformationButton />
      <i class="fa fa-cog">
        <p class="label__setting">設定</p>
      </i>
    </div>
  </div>
);

export default Map;
