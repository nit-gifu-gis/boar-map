import { useCallback, useEffect, useMemo, useState } from "react";
import { to_header_color, to_header_title } from "../../../../utils/header";
import FooterAdjustment from "../../../atomos/footerAdjustment";
import RoundButton from "../../../atomos/roundButton";
import FeatureViewer from "../../../organisms/featureViewer";
import Footer from "../../../organisms/footer";
import Header from "../../../organisms/header";
import { InputFormTemplateCommonProps } from "../interfaces";
import { InputFormData, useFormDataParser } from "../../../../utils/form-data";
import { useRouter } from "next/router";
import { BoarFeatureV2, FeatureBase } from "../../../../types/features";
import { alert, confirm } from "../../../../utils/modal";
import { getAccessToken } from "../../../../utils/currentUser";
import { SERVER_URI } from "../../../../utils/constants";

const DataConfirmTemplate: React.FC<InputFormTemplateCommonProps> = ({ isEditing }) => {
  const router = useRouter();
  const paramParser = useFormDataParser();

  const [imageArray, setImageArray] = useState<string[] | null>(null);
  const [serverImages, setServerImages] = useState<string[] | null>(null);
  const [featureInfo, setFeatureInfo] = useState<FeatureBase | null>(null);

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

  const [isLoading, setIsLoading] = useState(false);

  const deleteImage = (id: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const data = new FormData();
        data.append('id', id);
        const options = {
          method: 'POST',
          body: data,
          headers: {
            Accept: 'application/json',
            'X-Access-Token': getAccessToken(),
          },
        };
        fetch(`${SERVER_URI}/Image/DeleteImage`, options)
          .then((res) => {
            if (res.status === 200 || res.status === 404) {
              resolve();
            } else {
              return res.json();
            }
          })
          .then((json) => reject(json['reason']))
          .catch((e) => reject(e));
      } catch (e) {
        reject(e);
      }
    });
  };

  const uploadImage = useCallback(async  (objectURL: string) => {
    const url = `${SERVER_URI}/Image/AddImage?type=${paramParser.currentData.dataType}`;

    const body = new FormData();
    const blob = await fetch(objectURL).then((r) => r.blob());
    body.append('files[]', blob);

    const req = {
      method: 'POST',
      body: body,
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    };

    const r = await fetch(url, req);
    const json = await r.json();
    if (json['status'] == 200) {
      const resList = json['results'] as Record<string, unknown>[];
      if (resList.length > 0) {
        return resList[0]['id'] as string;
      }
    } else {
      console.error(json['reason']);
    }

    return null;
  }, [paramParser.currentData]);

  const onClickPrev = useCallback(() => {
    if (isEditing) {
      router.push('/edit/info');
    } else {
      router.push('/add/info');
    }
  }, []);
  
  const onClickNext = useCallback(async () => {
    if (await confirm('この内容でよろしいですか？')) {
      const newData = JSON.parse(JSON.stringify(paramParser.currentData)) as InputFormData;

      if (newData.inputData.gisData == undefined) {
        alert("エラーが発生しました。");
        return;
      }

      // 削除される画像リストの取得
      const origImg = paramParser.currentData.editData?.curImg.other.concat(paramParser.currentData.editData?.curImg.teeth) || [];
      const delImg = origImg.filter(e => !serverImages?.includes(e));

      setIsLoading(true);
      
      // 画像を削除
      await Promise.all(delImg.map(e => deleteImage(e)));

      // 対象の場合は歯列写真をアップロードしてFeatureにセット
      if((!isEditing && paramParser.currentData.dataType === 'boar') || (isEditing && paramParser.currentData.editData?.type_srv === 'boar-2')) {
        const teethImageIds = (await Promise.all((paramParser.currentData.inputData.teethImageUrls || []).map(e => uploadImage(e.objectURL)))).filter(e => e != null);
        
        const currentIds = (newData.inputData.gisData.properties as Record<string, string>)["歯列写真ID"].split(",");
        const newIds = currentIds.concat(teethImageIds).filter(e => e);
        (newData.inputData.gisData.properties as Record<string, string>)['歯列写真ID'] = newIds.join(',');
      }

      // 画像をアップロードしてFeatureにセット
      const otherImageIds = (await Promise.all((paramParser.currentData.inputData.otherImageUrls || []).map(e => uploadImage(e.objectURL)))).filter(e => e != null);
      const currentIds = (newData.inputData.gisData.properties as Record<string, string>)[t == "boar" ? "写真ID" : "画像ID"].split(",");
      const newIds = currentIds.concat(otherImageIds).filter(e => e);

      (newData.inputData.gisData.properties as Record<string, string>)[t == "boar" ? "写真ID" : "画像ID"] = newIds.join(',');

      let res = null;
      if (isEditing) {
        res = await fetch(SERVER_URI + '/Features/UpdateFeature', {
          method: 'POST',
          headers: {
            'X-Access-Token': getAccessToken(),
          },
          body: JSON.stringify({
            type: newData.editData?.type_srv,
            feature: newData.inputData.gisData,
          }),
        });
      } else {
        res = await fetch(SERVER_URI + '/Features/AddFeature', {
          method: 'POST',
          headers: {
            'X-Access-Token': getAccessToken(),
          },
          body: JSON.stringify({
            type: newData.dataType,
            feature: newData.inputData.gisData,
          }),
        });
      }

      const json = await res.json();

      if (res.status === 200) {
        await alert('登録が完了しました。\nご協力ありがとうございました。');
        setIsLoading(false);
        router.push('/map');
      } else {
        console.error(json['error']);
        await alert('エラーが発生しました。\n' + json['error']);
      }

      setIsLoading(false);
    }
  }, [serverImages, paramParser.currentData, t]);

  useEffect(() => {
    if (!paramParser.currentData.dataType) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    } 

    setImageArray((paramParser.currentData.inputData.teethImageUrls ?? []).concat(paramParser.currentData.inputData.otherImageUrls ?? []).map(e => e.objectURL));
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

    setFeatureInfo(paramParser.currentData.inputData.gisData as FeatureBase);
  }, []);

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>
        {to_header_title(type == null ? '' : type)}{isEditing ? '編集' : '登録'}
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>情報に不備がないかご確認ください。</div>
      </div>
      <FeatureViewer
        featureInfo={featureInfo}
        type={t}
        objectURLs={imageArray == null ? undefined : imageArray}        
        imageIDs={serverImages == null ? undefined : serverImages}
        confirm={true}
      />
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={onClickPrev.bind(this)}>
            &lt; 戻る
          </RoundButton>
          <RoundButton color='danger' onClick={onClickNext.bind(this)} disabled={isLoading}>
            {isLoading ? '読み込み中...' : '登録 >'}
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default DataConfirmTemplate;