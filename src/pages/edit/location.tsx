import { NextPage } from "next";
import EditLocationTemplate from "../../components/templates/editLocationTemplate";
import { useRequireLogin } from "../../hooks/useLogin";

const EditLocationPage: NextPage = () => {
  useRequireLogin();
  return  <>
    <EditLocationTemplate />
  </>;
};

export default EditLocationPage;