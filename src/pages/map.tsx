import { NextPage } from 'next';
import MapTemplate from '../components/templates/mapTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const MapPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <MapTemplate />
    </>
  );
};

export default MapPage;
