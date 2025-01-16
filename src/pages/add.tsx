import { NextPage } from 'next';
import { useRequireLogin } from '../hooks/useLogin';
import AddTypeSelectorTemplate from '../components/templates/newDataForm/addTypeSelectorTemplate';

const AddPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddTypeSelectorTemplate />
    </>
  );
};

export default AddPage;
