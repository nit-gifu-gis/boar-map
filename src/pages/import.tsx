import { NextPage } from "next";
import ImportTemplate from "../components/templates/importTemplate";
import { useRequireLogin } from "../hooks/useLogin";

const ImportPage: NextPage = () => {
  useRequireLogin();
  return <>
    <ImportTemplate />
  </>;
};

export default ImportPage;