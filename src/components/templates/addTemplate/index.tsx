import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { hasWritePermission, LayerType } from '../../../utils/gis';
import { alert } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import InfoTypeSelector from '../../organisms/infoTypeSelector';

const AddTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [selected, setSelected] = useState<LayerType | null>(
    router.query.type == null ? null : (router.query.type as LayerType),
  );

  const onClickNext = async () => {
    if (currentUser == null) return;
    if (selected == null) {
      await alert('登録する情報の種類が選択されていません！');
      return;
    }
    if (!hasWritePermission(selected, currentUser)) {
      await alert('指定された種類の情報を登録する権限がありません！');
      return;
    }

    router.push(
      {
        pathname: '/add/image',
        query: {
          type: selected,
        },
      },
      '/add/image',
    );
  };

  return (
    <div>
      <Header color='primary'>情報登録</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-4 mt-1 mb-1'>情報の種類を選択してください。</div>
        <InfoTypeSelector
          onChanged={(type) => setSelected(type)}
          defaultValue={router.query.type == null ? null : (router.query.type as LayerType)}
        />
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={() => router.push('/map')}>
            &lt; 戻る
          </RoundButton>
          <RoundButton
            color='primary'
            onClick={onClickNext.bind(this)}
            disabled={selected == null || currentUser == null}
          >
            進む &gt;
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default AddTemplate;
