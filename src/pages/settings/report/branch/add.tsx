import { NextPage } from "next";
import ReportBranchAddTemplate from "../../../../components/templates/reportBranchAddTemplate";
import { useRequireLogin } from "../../../../hooks/useLogin";

const ReportBranchAddPage: NextPage = () => {
  useRequireLogin();
  return <>
    <ReportBranchAddTemplate />
  </>;
};

export default ReportBranchAddPage;