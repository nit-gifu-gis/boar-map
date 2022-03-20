import { useRouter } from "next/router";
import { useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { hasWritePermission, LayerType } from "../../../utils/gis";
import { alert } from "../../../utils/modal";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";
import InfoTypeSelector from "../../organisms/infoTypeSelector";

const AddTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [selected, setSelected] = useState<LayerType | null>(null);

  const onClickNext = async () => {
    if(currentUser == null) return;
    if(selected == null) {
      await alert("登録する情報の種類が選択されていません！");
      return;
    }
    if(!hasWritePermission(selected, currentUser)) {
      await alert("指定された種類の情報を登録する権限がありません！");
      return;
    }

    router.push(
      {
        pathname: '/add/image',
        query: {
          type: selected
        }
      },
      '/add/image'
    );
  };

  return (
    <div>
      <Header color="primary">情報登録</Header>
      <div className="bg-background max-w-[400px] w-full mx-auto py-3">
        <div className="mt-1 mx-4 mb-1">情報の種類を選択してください。</div>
        <InfoTypeSelector onChanged={(type) => setSelected(type)} />
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={() => router.push('/map')}>
            戻る
          </RoundButton>
          <RoundButton color='danger' onClick={onClickNext.bind(this)} disabled={selected == null || currentUser == null}>
            削除
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default AddTemplate;