import { NextPage } from 'next';
import AddTemplate from '../components/templates/addTemplate';
import { useRequireLogin } from '../hooks/useLogin';

const AddPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddTemplate />
    </>
  );
};

export default AddPage;
