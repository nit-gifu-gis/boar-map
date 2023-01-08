import { NextPage } from 'next';
import JibieTraderSettingsTemplate from '../../../components/templates/jibieTraderSettingsTemplate';
import { useRequireLogin } from '../../../hooks/useLogin';

const JibieTraderSettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <JibieTraderSettingsTemplate />
    </>
  );
};

export default JibieTraderSettingsPage;
