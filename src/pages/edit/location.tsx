import { NextPage } from 'next';

import LocationSelectorTemplate from '@/components/templates/newDataForm/locationSelector';
import { useRequireLogin } from '@/hooks/useLogin';

const EditLocationPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <LocationSelectorTemplate isEditing={true} />
    </>
  );
};

export default EditLocationPage;
