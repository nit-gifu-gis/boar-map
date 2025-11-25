import { NextPage } from 'next';

import CommonInfoInputTemplate from '@/components/templates/newDataForm/commonInfoInput';
import { useRequireLogin } from '@/hooks/useLogin';

const AddInfoPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <CommonInfoInputTemplate isEditing={false} />
    </>
  );
};

export default AddInfoPage;
