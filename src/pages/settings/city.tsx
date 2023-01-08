import { NextPage } from 'next';
import CitySettingsTemplate from '../../components/templates/citySettingsTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const CitySettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <CitySettingsTemplate />
    </>
  );
};

export default CitySettingsPage;
