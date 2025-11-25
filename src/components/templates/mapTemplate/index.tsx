import { useRouter } from 'next/router';

import FooterAdjustment from '@/components/atomos/footerAdjustment';
import RoundButton from '@/components/atomos/roundButton';
import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import MapBase from '@/components/organisms/mapBase';
import { useFormDataParser } from '@/utils/form-data';

const MapTemplate: React.FunctionComponent = () => {
  const formParser = useFormDataParser();
  const router = useRouter();

  const onClickAdd = () => {
    formParser.updateData(null);
    router.push('/add');
  };

  return (
    <div className='flex h-screen flex-col'>
      <Header>マップ</Header>
      <MapBase isMainMap={true} />
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='primary' onClick={onClickAdd.bind(this)}>
            新規情報登録
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default MapTemplate;
