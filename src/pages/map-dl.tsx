import { NextPage } from 'next';
import MapDLTemplate from '../components/templates/mapDlTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const MapDLPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <MapDLTemplate />
    </>
  );
};

export default MapDLPage;
