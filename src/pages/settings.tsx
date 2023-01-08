import { NextPage } from 'next';
import SettingsTemplate from '../components/templates/settingsTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const SettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <SettingsTemplate />
    </>
  );
};

export default SettingsPage;
