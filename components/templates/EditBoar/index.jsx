import "./editBoar.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import BoarEditForm from "../../organisms/boarEditForm";
import Router from "next/router";

class EditBoar extends React.Component {
  state = {
    detail: undefined
  };

  componentDidMount() {
    if (Router.query.detail != undefined) {
      this.setState({
        detail: Router.query.detail,
        type: Router.query.type
      });
    } else {
      Router.push("/map");
    }
  }
  render() {
    if (this.state.detail != undefined) {
      return (
        <div>
          <Header />
          <BoarEditForm
            detail={JSON.parse(Router.query.detail)}
            type={Router.query.type}
          />
          <Footer />
        </div>
      );
    } else {
      return (
        <div>
          <Header />
          <h1>情報取得中</h1>
          <Footer />
        </div>
      );
    }
  }
}

export default EditBoar;
