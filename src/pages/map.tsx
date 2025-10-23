import { NextPage } from 'next';
import { useRequireLogin } from '../hooks/useLogin';
import { useRouter } from 'next/router';
import FooterAdjustment from '../components/atomos/footerAdjustment';
import RoundButton from '../components/atomos/roundButton';
import Footer from '../components/organisms/footer';
import Header from '../components/organisms/header';
import MapBase from '../components/organisms/mapBase';
import { useFormDataParser } from '../utils/form-data';
import { useTranslation } from '../i18n/useTranslation';

const MapPage: NextPage = () => {
  useRequireLogin();

  const formParser = useFormDataParser();
  const router = useRouter();
  const { t, locale } = useTranslation();

  const onClickAdd = () => {
    formParser.updateData(null);
    router.push('/add');
  };

  return (
    <>
      <div className='flex h-screen flex-col'>
        <Header>{t('map')}</Header>
        <MapBase isMainMap={true} key={locale} />
        <FooterAdjustment />
        <div className='fixed bottom-0 w-full'>
          <Footer>
            <RoundButton color='primary' onClick={onClickAdd.bind(this)}>
              {t('create-new-rec')}
            </RoundButton>
          </Footer>
        </div>
      </div>
    </>
  );
};

export default MapPage;
