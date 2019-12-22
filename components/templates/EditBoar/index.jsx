import "./editBoar.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import BoarEditForm from "../../organisms/boarEditForm";
import Router from "next/router";

class EditBoar extends React.Component {
  render() {
    return (
      <div>
        <BoarEditForm
          detail={JSON.parse(Router.query.detail)}
          type={Router.query.type}
        />
      </div>
    );
  }
}

export default EditBoar;
