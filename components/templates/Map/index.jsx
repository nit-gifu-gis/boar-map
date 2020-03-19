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
    <DynamicMapComponentWithNoSSR isMainMap={true} />
    <AddInformationButton />
    <div className="footer-nav">
      <i className="fa fa-map">
        <p className="label__map">マップ</p>
      </i>

      <Link href="../menu">
        <a>
          <i className="fa fa-cog">
            <p className="label__setting">設定</p>
          </i>
        </a>
      </Link>
    </div>
  </div>
);

export default Map;
