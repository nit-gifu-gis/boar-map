import { useState } from "react";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { hasWritePermission, LayerType } from "../../../../utils/gis";
import { useRouter } from "next/router";
import { useFormDataParser } from "../../../../utils/form-data";
import Header from "../../../organisms/header";
import InfoTypeSelector from "../../../organisms/infoTypeSelector";
import FooterAdjustment from "../../../atomos/footerAdjustment";
import Footer from "../../../organisms/footer";
import RoundButton from "../../../atomos/roundButton";

const AddTypeSelectorTemplate = () => {
  const paramParser = useFormDataParser();

  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [selected, setSelected] = useState<LayerType | null>(
    paramParser.currentData.dataType ?? null
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

    const isImageSkip = selected === 'report' || selected === 'butanetsu' || selected === 'youton';

    paramParser.updateData({ dataType: selected, isLocationSkipped: false, isImageSkipped: isImageSkip, inputData: {} });
    
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
      <Header color='primary'>情報登録</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-4 mt-1 mb-1'>情報の種類を選択してください。</div>
        <InfoTypeSelector
          onChanged={(type) => setSelected(type)}
          defaultValue={paramParser.currentData.dataType ?? null}
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

export default AddTypeSelectorTemplate;