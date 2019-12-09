import "./detail.scss";
import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import Router from "next/router";

const Detail = () => (
  <div>
    <Header />
    <h1>
      You've selected Feature ID: {Router.query.FeatureID}, Type:{" "}
      {Router.query.type}
    </h1>
    <Footer />
  </div>
);

export default Detail;
