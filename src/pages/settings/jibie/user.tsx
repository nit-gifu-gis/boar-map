import { NextPage } from "next";
import JibieUserSettingsTemplate from "../../../components/templates/jibieUserSettingsTemplate";
import { useRequireLogin } from "../../../hooks/useLogin";

const JibieUserSettingsPage: NextPage = () => {
  useRequireLogin();
  return <>
    <JibieUserSettingsTemplate />
  </>;
};

export default JibieUserSettingsPage;