import { NextPage } from "next";
import EditConfirmTemplate from "../../components/templates/editConfirmTemplate";
import { useRequireLogin } from "../../hooks/useLogin";

const EditConfirmPage: NextPage = () => {
  useRequireLogin();
  return  <>
    <EditConfirmTemplate />
  </>;
};

export default EditConfirmPage;