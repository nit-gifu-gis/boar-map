import { NextPage } from "next";
import CityAddTemplate from "../../../components/templates/cityAddTemplate";
import { useRequireLogin } from "../../../hooks/useLogin";

const CityAddPage: NextPage = () => {
  useRequireLogin();
  return <>
    <CityAddTemplate />
  </>;
};

export default CityAddPage;