import { NextPage } from 'next';
import AddImageTemplate from '../../components/templates/addImageTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const AddImagePage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddImageTemplate />
    </>
  );
};

export default AddImagePage;
