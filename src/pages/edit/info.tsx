import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import CommonInfoInputTemplate from '../../components/templates/newDataForm/commonInfoInput';

const EditInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <CommonInfoInputTemplate isEditing={true} />
    </>
  );
};

export default EditInfoPage;
