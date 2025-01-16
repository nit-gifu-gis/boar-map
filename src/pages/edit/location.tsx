import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import LocationSelectorTemplate from '../../components/templates/newDataForm/locationSelector';

const EditLocationPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <LocationSelectorTemplate isEditing={true} />
    </>
  );
};

export default EditLocationPage;
