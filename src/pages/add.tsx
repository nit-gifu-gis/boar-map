import { NextPage } from 'next';

import AddTypeSelectorTemplate from '@/components/templates/newDataForm/addTypeSelectorTemplate';
import { useRequireLogin } from '@/hooks/useLogin';

const AddPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <AddTypeSelectorTemplate />
    </>
  );
};

export default AddPage;
