import { NextPage } from "next";
import EditImageTemplate from "../../components/templates/editImageTemplate";
import { useRequireLogin } from "../../hooks/useLogin";

const EditImagePage: NextPage = () => {
  useRequireLogin();
  return  <>
    <EditImageTemplate />
  </>;
};

export default EditImagePage;