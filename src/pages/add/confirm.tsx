import { NextPage } from 'next';

import DataConfirmTemplate from '@/components/templates/newDataForm/dataConfirmTemplate';
import { useRequireLogin } from '@/hooks/useLogin';

const AddConfirmPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <DataConfirmTemplate isEditing={false} />
    </>
  );
};

export default AddConfirmPage;
