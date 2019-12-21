import "./editTrap.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import TrapEditForm from "../../organisms/trapEditForm";
import Router from "next/router";

const EditTrap = () => (
  <div>
    <Header />
    <TrapEditForm
      detail={JSON.parse(Router.query.detail)}
      type={Router.query.type}
    />
    <Footer />
  </div>
);

export default EditTrap;
