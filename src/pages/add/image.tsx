import { NextPage } from 'next';

import ImageSelectorTemplate from '@/components/templates/newDataForm/imageSelector';
import { useRequireLogin } from '@/hooks/useLogin';

const AddImagePage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ImageSelectorTemplate isEditing={false} />
    </>
  );
};

export default AddImagePage;
