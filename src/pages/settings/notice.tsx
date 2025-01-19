import { NextPage } from 'next';
import { useRequireLogin } from '../../hooks/useLogin';
import NoticeSettingsTemplate from '../../components/templates/noticeSettingsTemplate';

const NoticeSettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <NoticeSettingsTemplate />
    </>
  );
};

export default NoticeSettingsPage;
