import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import ImageSelectorTemplate from '../../components/templates/newDataForm/imageSelector';

const EditImagePage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ImageSelectorTemplate isEditing={true} />
    </>
  );
};

export default EditImagePage;
