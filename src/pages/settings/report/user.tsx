import { NextPage } from "next";
import ReportUserSettingsTemplate from "../../../components/templates/reportUserSettingsTemplate";
import { useRequireLogin } from "../../../hooks/useLogin";

const ReportUserSettingsPage: NextPage = () => {
  useRequireLogin();
  return <>
    <ReportUserSettingsTemplate />
  </>;
};

export default ReportUserSettingsPage;