import { NextPage } from 'next';

import ImageSelectorTemplate from '@/components/templates/newDataForm/imageSelector';
import { useRequireLogin } from '@/hooks/useLogin';

const EditImagePage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ImageSelectorTemplate isEditing={true} />
    </>
  );
};

export default EditImagePage;
