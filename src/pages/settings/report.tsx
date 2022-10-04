import { NextPage } from 'next';
import ReportSettingsTemplate from '../../components/templates/reportSettingsTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const ReportSettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ReportSettingsTemplate />
    </>
  );
};

export default ReportSettingsPage;
