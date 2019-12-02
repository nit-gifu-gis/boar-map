import "./addBoarLocation.scss";

import dynamic from "next/dynamic";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";

const DynamicMapComponentWithNoSSR = dynamic(
  () => import("../../organisms/mapForAddInfo"),
  {
    ssr: false
  }
);

const AddBoarLocation = () => (
  <div>
    <Header />
    <DynamicMapComponentWithNoSSR />
    <Footer />
  </div>
);

export default AddBoarLocation;
