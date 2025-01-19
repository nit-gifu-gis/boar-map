import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import CommonInfoInputTemplate from '../../components/templates/newDataForm/commonInfoInput';

const AddInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <CommonInfoInputTemplate isEditing={false} />
    </>
  );
};

export default AddInfoPage;
