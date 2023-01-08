import { NextPage } from 'next';
import ReportUserAddTemplate from '../../../../components/templates/reportUserAddTemplate';
import { useRequireLogin } from '../../../../hooks/useLogin';

const ReportUserAddPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ReportUserAddTemplate />
    </>
  );
};

export default ReportUserAddPage;
