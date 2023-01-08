import { NextPage } from 'next';
import JibieUserAddTemplate from '../../../../components/templates/jibieUserAddTemplate';
import { useRequireLogin } from '../../../../hooks/useLogin';

const JibieUserAddPage: NextPage = () => {
  useRequireLogin();

  return (
    <>
      <JibieUserAddTemplate />
    </>
  );
};

export default JibieUserAddPage;
