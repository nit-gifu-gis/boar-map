import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import DataConfirmTemplate from '../../components/templates/newDataForm/dataConfirmTemplate';

const AddConfirmPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <DataConfirmTemplate isEditing={false} />
    </>
  );
};

export default AddConfirmPage;
