import { NextPage } from "next";
import JibieSettingsTemplate from "../../components/templates/jibieSettingsTemplate";
import { useRequireLogin } from "../../hooks/useLogin";

const JibieSettingsPage: NextPage = () => {
  useRequireLogin();
  return <>
    <JibieSettingsTemplate />
  </>;
};

export default JibieSettingsPage;