import { useRouter } from 'next/router';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import MapBase from '../../organisms/mapBase';

const MapTemplate: React.FunctionComponent = () => {
  const router = useRouter();

  const onClickAdd = () => {
    router.push('/add');
  };

  return (
    <div className='flex h-screen flex-col'>
      <Header>マップ</Header>
      <MapBase isMainMap={true} />
      <Footer>
        <RoundButton color='primary' onClick={onClickAdd.bind(this)}>
          新規情報登録
        </RoundButton>
      </Footer>
    </div>
  );
};

export default MapTemplate;
