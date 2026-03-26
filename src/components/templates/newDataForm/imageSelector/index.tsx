import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import FooterAdjustment from '@/components/atomos/footerAdjustment';
import ImageInput from '@/components/atomos/imageInput';
import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import RoundButton from '@/components/atomos/roundButton';
import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import { InputFormData, useFormDataParser } from '@/utils/form-data';
import { to_header_color } from '@/utils/header';
import { createImageConfigs } from '@/utils/imageConfig';
import { alert } from '@/utils/modal';

import { InputFormTemplateCommonProps } from '../interfaces';

type AllImageIdsState = {
  [configKey: string]: string[];
};

type AllImagesState = {
  [configKey: string]: ImagewithLocation[] | null;
};

const ImageSelectorTemplate: React.FC<InputFormTemplateCommonProps> = ({ isEditing }) => {
  const router = useRouter();
  const paramParser = useFormDataParser();

  const type = paramParser.currentData.dataType;
  const type_srv = paramParser.currentData.editData?.type_srv;

  const imageConfigs = useMemo(
    () => createImageConfigs({ type, type_srv, isEditing }),
    [type, type_srv],
  );

  const getInitialImages = useCallback((configKey: string): ImagewithLocation[] | null => {
    const config = imageConfigs[configKey];
    if (!config) return null;
    
    const inputData = paramParser.currentData.inputData as Record<string, any>;
    return inputData?.[config.frontUrlKey] ?? null;
  }, [imageConfigs, paramParser.currentData.inputData]);

  // 各画像タイプのサーバーIDを取得するヘルパー関数
  const getServerImageIds = useCallback((configKey: string): string[] => {
    if (!isEditing) return [];

    const featureProps = paramParser.currentData.inputData?.gisData?.properties as
      | Record<string, string>
      | undefined;
    if (!featureProps) return [];

    const config = imageConfigs[configKey];
    if (!config || !config.condition) return [];

    const propertyKey = config.propertyKey;

    return (featureProps[propertyKey] ?? '').split(',').filter((e) => e);
  }, [isEditing, paramParser.currentData.inputData?.gisData, imageConfigs, type_srv]);

  const [newAllImageIds, setNewAllImageIds] = useState<AllImageIdsState>(() => {
    const initialIds: AllImageIdsState = {};
    
    Object.keys(imageConfigs).forEach((key) => {
      initialIds[key] = getServerImageIds(key);
    });
    
    return initialIds;
  });

  const [allImages, setAllImages] = useState<AllImagesState>(() => {
    const initialImages: AllImagesState = {};
    
    Object.keys(imageConfigs).forEach((key) => {
      initialImages[key] = getInitialImages(key);
    });
    
    return initialImages;
  });

  // 特定の画像タイプのIDを更新する関数
  const updateImageIds = useCallback((configKey: string, ids: string[]) => {
    setNewAllImageIds((prev) => ({
      ...prev,
      [configKey]: ids,
    }));
  }, []);

  // 特定の画像タイプの画像を更新する関数
  const updateImages = useCallback((configKey: string, images: ImagewithLocation[] | null) => {
    setAllImages((prev) => ({
      ...prev,
      [configKey]: images,
    }));
  }, []);

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
    const newData = JSON.parse(JSON.stringify(paramParser.currentData)) as InputFormData;

    if (!isEditing && !newData.inputData?.gisData) {
      newData.inputData.gisData = {
        geometry: {
          type: 'Point',
          coordinates: [NaN, NaN],
        },
        properties: {},
        type: 'Feature',
      };
    }

    const featureProps = newData.inputData?.gisData?.properties as Record<string, string>;

    // すべての画像設定に対して処理
    Object.entries(imageConfigs).forEach(([configKey, config]) => {
      if (!config.condition) return;

      // 画像URLを保存
      const urlKey = config.frontUrlKey;
      (newData.inputData as any)[urlKey] = allImages[configKey] ?? [];

      // 画像IDをプロパティに保存
      const propertyKey = config.propertyKey;
      
      featureProps[propertyKey] = newAllImageIds[configKey]?.join(',') ?? '';
    });

    console.log(newData);

    paramParser.updateData(newData as InputFormData);

    if (isEditing) {
      router.push('/edit/info');
    } else {
      router.push('/add/location');
    }
  }, [allImages, newAllImageIds, imageConfigs, type_srv, paramParser, isEditing, router]);

  const onClickPrev = useCallback(() => {
    if (sessionStorage.getItem('fromList') === "1") {
      sessionStorage.setItem('fromList', "2");
      router.push('/list');
      return;
    }

    if (isEditing) {
      if (paramParser.currentData.isLocationSkipped) {
        router.push(
          {
            pathname: '/detail',
            query: {
              type: paramParser.currentData.editData?.type,
              type_srv: paramParser.currentData.editData?.type_srv,
              id: paramParser.currentData.editData?.id,
              version: paramParser.currentData.editData?.version,
            },
          },
          '/detail',
        );
      } else {
        router.push('/edit/location');
      }
    } else {
      router.push('/add');
    }
  }, [paramParser.currentData]);

  const createImageChangeHandler = useCallback((configKey: string) => {
    return (files: ImagewithLocation[]) => {
      updateImages(configKey, files.length === 0 ? null : files);
    };
  }, [updateImages]);

  if (paramParser.isLoading) return <></>;

  const activeConfigs = Object.entries(imageConfigs).filter(([_, config]) => config.condition);

  return (
    <div>
      <Header color={to_header_color(paramParser.currentData.dataType ?? '')}>
        {isEditing ? '登録画像編集' : '画像登録'}
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>画像を登録してください。</div>
        <div className='mx-[15px] mt-2 text-justify'>
          {type === 'boar' ? (
            <>
              <div className='mt-2 flex'>
                <div>※&nbsp;</div>
                <div>各項目２枚まで登録可能です。</div>
              </div>
              <div className='mt-2 flex'>
                <div>※&nbsp;</div>
                <div>
                  歯列の写真は必ず遠沈管番号がわかるように
                  <br />
                  撮影してください。
                </div>
              </div>
              <div className='mt-3 flex'>
                <div>※&nbsp;</div>
                <div>
                  <span className='font-bold'>調査捕獲の場合:</span>
                  <br />
                  ・検体採取個体の歯列写真
                  <br />
                  ・全捕獲個体のそれぞれ全体の写真
                </div>
              </div>
              <div className='flex'>
                <div>※&nbsp;</div>
                <div>
                  <span className='font-bold'>狩猟の場合:</span>
                  <br />
                  ・検体採取個体の歯列写真
                  <br />
                  ・捕獲個体の写真
                </div>
              </div>
              <div className='flex'>
                <div>※&nbsp;</div>
                <div>
                  <span className='font-bold'>有害捕獲の場合:</span>
                  <br />
                  ・検体採取個体の歯列写真
                </div>
              </div>
            </>
          ) : (
            <>※ 画像は10枚まで登録できます。</>
          )}
        </div>
        {activeConfigs.map(([configKey, config]) => (
          <div key={configKey} className='box-border w-full px-[15px] py-2'>
            <div className='text-justify text-lg font-bold text-text'>
              {config.label}
              <ImageInput
                max_count={config.max}
                type={type}
                single_file={false}
                onChange={createImageChangeHandler(configKey)}
                objectURLs={allImages[configKey] ?? undefined}
                imageIDs={isEditing ? getServerImageIds(configKey) : undefined}
                onServerImageDeleted={(list) => updateImageIds(configKey, list)}
              />
            </div>
          </div>
        ))}
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
