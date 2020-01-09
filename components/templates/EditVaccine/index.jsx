import "./editVaccine.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import VaccineEditForm from "../../organisms/vaccineEditForm";
import Router from "next/router";

class EditVaccine extends React.Component {
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
          <VaccineEditForm
            detail={JSON.parse(this.state.detail)}
            type={this.state.type}
          />
        </div>
      );
    } else {
      return (
        <div>
          <h1>情報取得中</h1>
        </div>
      );
    }
  }
}

export default EditVaccine;
