import { NextPage } from 'next';

import NoticeSettingsTemplate from '@/components/templates/noticeSettingsTemplate';
import { useRequireLogin } from '@/hooks/useLogin';

const NoticeSettingsPage: NextPage = () => {
  useRequireLogin();
  return (
    <>
      <NoticeSettingsTemplate />
    </>
  );
};

export default NoticeSettingsPage;
