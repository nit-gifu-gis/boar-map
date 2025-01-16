import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import LocationSelectorTemplate from '../../components/templates/newDataForm/locationSelector';

const AddLocationPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <LocationSelectorTemplate isEditing={false} />
    </>
  );
};

export default AddLocationPage;
