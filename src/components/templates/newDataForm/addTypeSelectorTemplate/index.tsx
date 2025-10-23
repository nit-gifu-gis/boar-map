import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { hasWritePermission, LayerType } from '../../../../utils/gis';
import { useRouter } from 'next/router';
import { useFormDataParser } from '../../../../utils/form-data';
import Header from '../../../organisms/header';
import InfoTypeSelector from '../../../organisms/infoTypeSelector';
import FooterAdjustment from '../../../atomos/footerAdjustment';
import Footer from '../../../organisms/footer';
import RoundButton from '../../../atomos/roundButton';
import { useTranslation } from '../../../../i18n/useTranslation';

const AddTypeSelectorTemplate = () => {
  const paramParser = useFormDataParser();

  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [selected, setSelected] = useState<LayerType | null>(
    paramParser.currentData.dataType ?? null,
  );
  const { t, locale } = useTranslation();

  const onClickNext = async () => {
    if (currentUser == null) return;
    if (selected == null) {
      await alert(t('info-type-not-selected'));
      return;
    }
    if (!hasWritePermission(selected, currentUser)) {
      await alert(t('no-permission-for-info-type'));
      return;
    }

    const isImageSkip = selected === 'report' || selected === 'butanetsu' || selected === 'youton';

    paramParser.updateData({
      dataType: selected,
      isLocationSkipped: false,
      isImageSkipped: isImageSkip,
      inputData: {},
    });

    // 作業日報と豚熱要請確認情報、養豚場情報は画像の登録が必要ないので直接位置情報ページへ遷移
    // それ以外は画像の登録ページへ遷移
    if (isImageSkip) {
      router.push('/add/location');
    } else {
      router.push('/add/image');
    }
  };

  return (
    <div>
      <Header color='primary'>{t('register-info')}</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-4 mt-1 mb-1'>{t('pls-select-info-type')}</div>
        <InfoTypeSelector
          onChanged={(type) => setSelected(type)}
          defaultValue={paramParser.currentData.dataType ?? null}
          key={locale}
        />
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={() => router.push('/map')}>
            &lt; {t('back')}
          </RoundButton>
          <RoundButton
            color='primary'
            onClick={onClickNext.bind(this)}
            disabled={selected == null || currentUser == null}
          >
            {t('next')} &gt;
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default AddTypeSelectorTemplate;
