import "./editVaccine.scss";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";
import VaccineEditForm from "../../organisms/vaccineEditForm";

const EditVaccine = () => (
  <div>
    <Header />
    <VaccineEditForm
      detail={JSON.parse(Router.query.detail)}
      type={Router.query.type}
    />
    <Footer />
  </div>
);

export default EditVaccine;
