import { NextPage } from "next";
import ReportBranchSettingsTemplate from "../../../components/templates/reportBranchSettingsTemplate";
import { useRequireLogin } from "../../../hooks/useLogin";

const ReportBranchSettingsPage: NextPage = () => {
  useRequireLogin();
  return <>
    <ReportBranchSettingsTemplate />
  </>;
};

export default ReportBranchSettingsPage;