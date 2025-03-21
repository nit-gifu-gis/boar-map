import { NextPage } from 'next';
import ImageSettingsTemplate from '../../components/templates/imageSettingsTemplate';
import { useRequireLogin } from '../../hooks/useLogin';

const ImageSettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <ImageSettingsTemplate />
    </>
  );
};

export default ImageSettingsPage;
