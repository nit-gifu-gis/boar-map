import { NextPage } from 'next';
import AddInfoTemplate from '../../components/templates/addInfoTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const AddInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddInfoTemplate />
    </>
  );
};

export default AddInfoPage;
