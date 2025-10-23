import { GetStaticProps, NextPage } from 'next';
import { useRequireNotLogin } from '../hooks/useLogin';
import { getVersionInfo, VersionInformation } from '../utils/version';
import Image from 'next/image';
import Header from '../components/organisms/header';
import LoginForm from '../components/organisms/loginForm';
import RoundButton from '../components/atomos/roundButton';
import { REPORT_FORM_URL, SERVER_URI } from '../utils/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';

export interface LoginProps {
  version: VersionInformation;
}

export interface Notice {
  title: string;
  content: string;
}

const LoginPage: NextPage<LoginProps> = ({ version }: LoginProps) => {
  useRequireNotLogin();

  const { t } = useTranslation();

  const [notice, setNotice] = useState<Notice[]>([]);

  useEffect(() => {
    const asyncTask = async () => {
      const req = await fetch(`${SERVER_URI}/Settings/Notice`);
      const res = await req.json();
      setNotice(res.data);
    };

    asyncTask();
  }, []);

  const openReportForm = () => {
    window.open(REPORT_FORM_URL);
  };

  return (
    <>
      <div className='w-full'>
        <Header>{t('login')}</Header>
        <div className='mx-auto box-border w-full max-w-window px-2'>
          <div className='mt-1 w-full text-center'>
            <Image src='/login.png' width={400} height={110} alt='Main Logo' />
          </div>
          <div className='w-auto text-center text-4xl font-bold text-primary'>
            <span className='inline-block'>{t('boar')}</span>
            <span className='inline-block'>{t('map')}</span>
            <span className='inline-block'>{t('gifu')}</span>
          </div>
          <div className='w-auto text-center text-xl text-text'>
            <span className='inline-block'>{t('gifu-boarmap-app')}</span>
          </div>
          <div className='w-auto text-center text-lg text-small-text'>
            <span className='inline-block'>{version.latestNumber}</span>
          </div>
          <LoginForm />
          <hr />
          {notice.map((n, i) => (
            <div
              className='my-2 box-border rounded-2xl border-2 border-border px-3 py-2'
              key={'notice_' + i}
            >
              <span className='font-bold'>{n.title}</span>
              <br />
              <span className='whitespace-pre-wrap'>{n.content}</span>
            </div>
          ))}
          <div className='my-2 box-border whitespace-pre rounded-2xl border-2 border-border px-3 py-2'>
            {t('notice-renovating')}
            Tel.{' '}
            <a href='tel:0582728096' className='font-bold text-[#0000ff] underline'>
              058-272-8096
            </a>
            <br />({t('weekdays')}8:30～12:00、13:00〜17:15)
            <br />
            <br />
            {t('accepting-report')}
            Tel.{' '}
            <a href='tel:0582728096' className='font-bold text-[#0000ff] underline'>
              058-272-8096
            </a>
            <br />({t('weekdays')}8:30～12:00、13:00〜17:15)
            <br />
            Fax. <span className='font-bold'>058-278-3533</span>
            <br />
            <div className='my-3'>
              <RoundButton color='excel' onClick={openReportForm}>
                {t('sample-form')}
              </RoundButton>
            </div>
          </div>
          <div className='pt-8 text-center'>
            &copy; 2019-2025 National Institute of Technology, Gifu College GIS Team
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

// バージョン情報はビルド時に取得
export const getStaticProps: GetStaticProps = async () => {
  return { props: { version: getVersionInfo() } };
};
