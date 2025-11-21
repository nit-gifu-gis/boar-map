import { NextPage } from 'next';

import DataConfirmTemplate from '@/components/templates/newDataForm/dataConfirmTemplate';
import { useRequireLogin } from '@/hooks/useLogin';

const EditConfirmPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <DataConfirmTemplate isEditing={true} />
    </>
  );
};

export default EditConfirmPage;
