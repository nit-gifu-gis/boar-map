import { NextPage } from 'next';
import EditInfoTemplate from '../../components/templates/editInfoTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const EditInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <EditInfoTemplate />
    </>
  );
};

export default EditInfoPage;
