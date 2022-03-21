import { NextPage } from 'next';
import AddConfirmTemplate from '../../components/templates/addConfirmTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const AddConfirmPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddConfirmTemplate />
    </>
  );
};

export default AddConfirmPage;
