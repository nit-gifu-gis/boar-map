import { NextPage } from 'next';
import AddLocationTemplate from '../../components/templates/addLocationTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const AddLocationPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddLocationTemplate />
    </>
  );
};

export default AddLocationPage;
