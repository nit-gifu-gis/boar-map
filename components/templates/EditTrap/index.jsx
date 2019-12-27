import "./editTrap.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import TrapEditForm from "../../organisms/trapEditForm";
import Router from "next/router";

const EditTrap = () => (
  <div>
    <TrapEditForm
      detail={JSON.parse(Router.query.detail)}
      type={Router.query.type}
    />
  </div>
);

export default EditTrap;
