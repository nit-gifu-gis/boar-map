import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import ImageSelectorTemplate from '../../components/templates/newDataForm/imageSelector';

const AddImagePage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ImageSelectorTemplate isEditing={false} />
    </>
  );
};

export default AddImagePage;
