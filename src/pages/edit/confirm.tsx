import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import DataConfirmTemplate from '../../components/templates/newDataForm/dataConfirmTemplate';

const EditConfirmPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <DataConfirmTemplate isEditing={true} />
    </>
  );
};

export default EditConfirmPage;
