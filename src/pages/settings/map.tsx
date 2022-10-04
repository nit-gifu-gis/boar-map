import { NextPage } from 'next';
import MapSettingsTemplate from '../../components/templates/mapSettingsTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const MapSettingsPage: NextPage = () => {
  useRequireLogin();
  return <MapSettingsTemplate />;
};

export default MapSettingsPage;
