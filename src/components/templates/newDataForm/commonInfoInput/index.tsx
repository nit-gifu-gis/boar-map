import { useCallback, useEffect, useMemo, useState } from "react";
import { to_header_color, to_header_title } from "../../../../utils/header";
import FooterAdjustment from "../../../atomos/footerAdjustment";
import RoundButton from "../../../atomos/roundButton";
import Footer from "../../../organisms/footer";
import Header from "../../../organisms/header";
import { InputFormTemplateCommonProps } from "../interfaces";
import { useRouter } from "next/router";
import { InputFormData, useFormDataParser } from "../../../../utils/form-data";
import FeatureEditor from "../../../organisms/featureEditor";
import { FeatureEditorHandler } from "../../../organisms/featureEditor/interface";
import React from "react";
import { ImagewithLocation } from "../../../atomos/imageInput/interface";
import { alert } from '../../../../utils/modal';

const CommonInfoInputTemplate: React.FC<InputFormTemplateCommonProps> = ({ isEditing }) => {
  const router = useRouter();
  const paramParser = useFormDataParser();

  const [editorRef, setEditorRef] = useState<React.RefObject<FeatureEditorHandler> | null>(null);
  const [imageArray, setImageArray] = useState<ImagewithLocation[] | null>(null);
  const [serverImages, setServerImages] = useState<string[] | null>(null);

  const type = paramParser.currentData.dataType;
  const t = useMemo(() => {
    const tt = paramParser.currentData.editData?.type_srv;
    if (tt == null) {
      return paramParser.currentData.dataType;
    } else if(tt === 'boar-1') {
      return 'boar-old';
    } else if(tt === 'boar-2') {
      return 'boar';
    }

    return tt;
  }, [paramParser.currentData]);

  const location = useMemo(() => {
    return {
      isDefault: false,
      lat: paramParser.currentData.inputData.gisData?.geometry?.coordinates[1] ?? 0,
      lng: paramParser.currentData.inputData.gisData?.geometry?.coordinates[0] ?? 0,
      zoom: 17
    };
  }, [paramParser.currentData]);

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!paramParser.currentData.dataType) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    }

    if (editorRef == null) {
      setEditorRef(React.createRef());
    }

    setImageArray((paramParser.currentData.inputData.teethImageUrls ?? []).concat(paramParser.currentData.inputData.otherImageUrls ?? []));
    setServerImages(() => {
      const featureProps = paramParser.currentData.inputData?.gisData?.properties as Record<string, string>;
      if (!featureProps)
        return [];

      const arr 
        = (featureProps['歯列写真ID'] || '')
          .split(',')
          .concat((featureProps['写真ID'] || '').split(','))
          .concat((featureProps['画像ID'] || '').split(','))
          .filter((e) => e);
      return arr;
    });
  }, [paramParser.currentData, editorRef]);

  const onClickPrev = useCallback(() => {
    if (isEditing) {
      if (paramParser.currentData.isImageSkipped) {
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
        router.push('/edit/image');
      }
    } else {
      router.push('/add/location');
    }
  }, []);

  const onClickNext = useCallback(async () => {
    if (editorRef == null) {
      // 本来は起きないはず
      alert('内部エラーが発生しました。');
      return;
    }
    setIsValidating(true);

    if (!(await editorRef.current?.validateData())) {
      alert('入力内容にエラーがあります。ご確認ください。');
      setIsValidating(false);
      return;
    }

    const featureInfo = await editorRef.current?.fetchData();
    if (featureInfo == null) {
      alert('情報の取得に失敗しました。');
      setIsValidating(false);
      return;
    }
    setIsValidating(false);

    const newData = JSON.parse(JSON.stringify(paramParser.currentData)) as InputFormData;
    newData.inputData.gisData = featureInfo;
    paramParser.updateData(newData);
    
    if (isEditing) {
      router.push('/edit/confirm');
    } else {
      router.push('/add/confirm');
    }
  }, [editorRef, paramParser.currentData]);

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>
        {to_header_title(type == null ? '' : type)}{isEditing ? '編集' : '登録'}
      </Header>
      <FeatureEditor
        type={t}
        location={location}
        featureInfo={paramParser.currentData.inputData.gisData}
        ref={editorRef}
        objectURLs={imageArray == null ? undefined : imageArray}
        imageIds={serverImages == null ? undefined : serverImages}
      />
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={onClickPrev.bind(this)}>
                &lt; 戻る
          </RoundButton>
          <RoundButton color='primary' onClick={onClickNext.bind(this)} disabled={isValidating}>
            {isValidating ? '読み込み中...' : '進む >'}
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default CommonInfoInputTemplate;