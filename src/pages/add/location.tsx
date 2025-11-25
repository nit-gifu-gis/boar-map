import { NextPage } from 'next';

import LocationSelectorTemplate from '@/components/templates/newDataForm/locationSelector';
import { useRequireLogin } from '@/hooks/useLogin';

const AddLocationPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <LocationSelectorTemplate isEditing={false} />
    </>
  );
};

export default AddLocationPage;
