import { NextPage } from 'next';

import CommonInfoInputTemplate from '@/components/templates/newDataForm/commonInfoInput';
import { useRequireLogin } from '@/hooks/useLogin';

const EditInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <CommonInfoInputTemplate isEditing={true} />
    </>
  );
};

export default EditInfoPage;
