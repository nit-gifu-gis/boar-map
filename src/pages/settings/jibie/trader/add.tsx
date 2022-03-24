import { NextPage } from "next";
import JibieTraderAddTemplate from "../../../../components/templates/jibieTraderAddTemplate";
import { useRequireLogin } from "../../../../hooks/useLogin";

const JibieTraderAddPage: NextPage = () => {
  useRequireLogin();

  return <>
    <JibieTraderAddTemplate />
  </>;
};

export default JibieTraderAddPage;