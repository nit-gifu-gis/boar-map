import { NextPage } from 'next';
import ListTemplate from '../components/templates/listTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const MapPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <ListTemplate />
    </>
  );
};

export default MapPage;
