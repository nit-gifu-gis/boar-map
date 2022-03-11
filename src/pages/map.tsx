import { NextPage } from 'next';
import { useRequireLogin } from '../hooks/useLogin';

const MapPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <h1>Map</h1>
    </>
  );
};

export default MapPage;