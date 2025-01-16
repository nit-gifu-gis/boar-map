import { useCallback, useEffect, useMemo, useState } from "react";
import { InputFormData, useFormDataParser } from "../../../../utils/form-data";
import { to_header_color } from "../../../../utils/header";
import FooterAdjustment from "../../../atomos/footerAdjustment";
import RoundButton from "../../../atomos/roundButton";
import Footer from "../../../organisms/footer";
import Header from "../../../organisms/header";
import { InputFormTemplateCommonProps } from "../interfaces";
import { useRouter } from "next/router";
import ImageInput from "../../../atomos/imageInput";
import { ImagewithLocation } from "../../../atomos/imageInput/interface";
import { alert } from '../../../../utils/modal';

const ImageSelectorTemplate: React.FC<InputFormTemplateCommonProps> = ({ isEditing }) => {
  const router = useRouter();
  const paramParser = useFormDataParser();

  const type = paramParser.currentData.dataType;

  const currentServerOtherImageIds = useMemo(() => {
    if (!isEditing) return [];
    
    const featureProps = paramParser.currentData.inputData?.gisData?.properties as Record<string, string> | undefined;
    if (!featureProps) return [];

    const t = paramParser.currentData.editData?.type_srv;
    
    return (featureProps[t === 'boar-2' ? '写真ID' : '画像ID'] ?? '').split(',').filter((e) => e);
  }, [isEditing, paramParser.currentData.inputData?.gisData, paramParser.currentData.editData?.type_srv]);
  const [newOtherImageIds, setNewOtherImageIds] = useState<string[]>(currentServerOtherImageIds);
  const [otherImages, setOtherImages] = useState<ImagewithLocation[] | null>(paramParser.currentData.inputData?.otherImageUrls ?? null);

  const currentServerTeethImageIds = useMemo(() => {
    if (!isEditing) return [];

    const featureProps = paramParser.currentData.inputData?.gisData?.properties as Record<string, string> | undefined;
    if (!featureProps) return [];

    const t = paramParser.currentData.editData?.type_srv;
    if (t !== 'boar-2')
      return [];

    return featureProps['歯列写真ID'].split(',').filter((e) => e);
  }, [isEditing, paramParser.currentData.inputData?.gisData, paramParser.currentData.editData?.type_srv]);
  const [newTeethImageIds, setNewTeethImageIds] = useState<string[]>(currentServerTeethImageIds);
  const [teethImages, setTeethImages] = useState<ImagewithLocation[] | null>(paramParser.currentData.inputData?.teethImageUrls?? null);


  useEffect(() => {
    if (!paramParser.currentData.dataType) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    }

    // 画像登録が必要ない情報の場合は位置情報選択画面に遷移
    if (paramParser.currentData.isImageSkipped && !isEditing) {
      router.push('/add/location');
    }
  }, [paramParser.currentData]);
    
  const onClickNext = useCallback(() => {
    const t = paramParser.currentData.editData?.type_srv;
    
    // 現在の入力情報を保存する。
    const newData = JSON.parse(JSON.stringify(paramParser.currentData)) as InputFormData;

    if (!isEditing && !newData.inputData?.gisData) {
      // 新規登録の場合はベースとなるデータを作成
      newData.inputData.gisData = {
        geometry: {
          type: 'Point',
          coordinates: [NaN, NaN]
        },
        properties: {},
        type: 'Feature'
      };
    }
    const featureProps = newData.inputData?.gisData?.properties as Record<string, string>;

    newData.inputData.teethImageUrls = teethImages ?? [];
    newData.inputData.otherImageUrls = otherImages ?? [];

    if (type === 'boar') {
      featureProps['歯列写真ID'] = newTeethImageIds.join(',');
    }

    featureProps[t === 'boar-2' ? '写真ID' : '画像ID'] = newOtherImageIds.join(',');

    paramParser.updateData(newData as InputFormData);

    // ページを遷移する

    if (isEditing) {
      router.push('/edit/info');
    } else {
      router.push('/add/location');
    }
  }, [teethImages, otherImages, newOtherImageIds, newTeethImageIds, paramParser.currentData]);

  const onClickPrev = useCallback(() => {
    if (isEditing) {
      if (paramParser.currentData.isLocationSkipped) {
        router.push(
          {
            pathname: '/detail',
            query: {
              type: paramParser.currentData.editData?.type,
              type_srv: paramParser.currentData.editData?.type_srv,
              id: paramParser.currentData.editData?.id,
              version: paramParser.currentData.editData?.version
            }
          }, 
          '/detail'
        );
      } else {
        router.push('/edit/location');
      }
    } else {
      router.push('/add');
    }
  }, [paramParser.currentData]);

  const onChangeTeethImages = (files: ImagewithLocation[]) => {
    if (files.length === 0) {
      setTeethImages(null);
    } else {
      setTeethImages(files);
    }
  };

  const onChangeOtherImages = (files: ImagewithLocation[]) => {
    if (files.length === 0) {
      setOtherImages(null);
    } else {
      setOtherImages(files);
    }
  };

  if (paramParser.isLoading) return <></>;

  return (
    <div>
      <Header color={to_header_color(paramParser.currentData.dataType ?? '')}>{isEditing ? "登録画像編集" : "画像登録"}</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>画像を登録してください。</div>
        <div className='mx-[15px] mt-2 text-justify'>
          {type === 'boar' ? (
            <>
              <div className="flex mt-2">
                <div>※&nbsp;</div>
                <div>歯列の写真は2枚まで登録できます。</div>
              </div>
              <div className="flex mt-2">
                <div>※&nbsp;</div>
                <div>その他の写真は8枚まで登録できます。</div>
              </div>
              <div className="flex mt-2">
                <div>※&nbsp;</div>
                <div>歯列の写真は必ず遠沈管番号がわかるように<br />撮影してください。</div>
              </div>
              <div className="flex mt-3">
                <div>※&nbsp;</div>
                <div>
                  <span className="font-bold">有害捕獲の場合:</span><br />
                  ・検体採取個体の歯列写真
                </div>
              </div>
              <div className="flex">
                <div>※&nbsp;</div>
                <div>
                  <span className="font-bold">調査捕獲の場合:</span><br />
                  ・検体採取個体の歯列写真<br />
                  ・全捕獲個体のそれぞれ全体の写真
                </div>
              </div>
            </>
          ) : (
            <>※ 画像は10枚まで登録できます。</>
          )}
        </div>
        {type != 'boar' ? <></> : (
          <div className='box-border w-full px-[15px] py-2'>
            <div className='text-justify text-lg font-bold text-text'>
              歯列の画像
              <ImageInput
                max_count={type === 'boar' ? 2 : 10}
                type={type}
                single_file={false}
                onChange={onChangeTeethImages}
                objectURLs={teethImages == null ? undefined : teethImages}
                imageIDs={isEditing ? currentServerTeethImageIds : undefined}
                onServerImageDeleted={(list) => setNewTeethImageIds(list)}
              />
            </div>
          </div>
        )}
        <div className='box-border w-full px-[15px] py-2'>
          <div className='text-justify text-lg font-bold text-text'>
            {type == 'boar' ? 'その他の' : ''}画像
            <ImageInput
              max_count={type === 'boar' ? 8 : 10}
              type={type}
              single_file={false}
              onChange={onChangeOtherImages}
              objectURLs={otherImages == null ? undefined : otherImages}
              imageIDs={isEditing ? currentServerOtherImageIds : undefined}
              onServerImageDeleted={(list) => setNewOtherImageIds(list)}
            />
          </div>
        </div>
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={onClickPrev.bind(this)}>
            &lt; 戻る
          </RoundButton>
          <RoundButton color='primary' onClick={onClickNext.bind(this)}>
            進む &gt;
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default ImageSelectorTemplate;