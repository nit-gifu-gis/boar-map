import { NextPage } from 'next';
import DetailTemplate from '../components/templates/detailTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const DetailPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <DetailTemplate />
    </>
  );
};

export default DetailPage;
