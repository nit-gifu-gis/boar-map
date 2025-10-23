import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/organisms/header';
import { useTranslation } from '../i18n/useTranslation';

const IndexPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className='w-screen'>
        <Header>{t('top-page')}</Header>
        <div className='mx-auto box-border w-screen max-w-window px-2'>
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
          <div className='w-auto py-5 text-center text-xl text-text'>
            <span className='inline-block'>{t('select-which')}</span>
          </div>
          <div className='mx-auto flex flex-wrap justify-around pt-5'>
            <div className='shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-trace before:block before:pb-full'>
              <Link href='/trace'>
                <a>
                  <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center whitespace-pre rounded-lg p-1 text-center text-xl'>
                    {t('trace-jibie')}
                  </div>
                </a>
              </Link>
            </div>
            <div className='shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-map before:block before:pb-full'>
              <Link href='/map'>
                <a>
                  <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center whitespace-pre rounded-lg p-1 text-center text-xl'>
                    {t('map')}
                  </div>
                </a>
              </Link>
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

export default IndexPage;
