import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FeatureBase } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { to_header_color, to_header_title } from '../../../utils/header';
import { alert, confirm } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import FeatureViewer from '../../organisms/featureViewer';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { LatLngZoom } from '../../organisms/mapBase/interface';

const AddConfirmTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [images, setImages] = useState<Record<
    string,
    ImagewithLocation | ImagewithLocation[] | null
  > | null>(null);
  const [, setLocation] = useState<LatLngZoom | null>(null);
  const [feature, setFeature] = useState<FeatureBase | null>(null);
  const [imageArray, setImageArray] = useState<ImagewithLocation[] | null>(null);
  const [isLoading, setLoading] = useState(false);

  const uploadImages = async (): Promise<string[]> => {
    const imgData = JSON.parse(router.query.images as string) as Record<
      string,
      null | ImagewithLocation | ImagewithLocation[]
    >;
    if (imgData == null || imgData.otherImages == null || !Array.isArray(imgData.otherImages)) {
      // ない場合は空の配列
      return [];
    }
    const imgArr = imgData.otherImages as ImagewithLocation[];
    // 1枚も画像がなければ空の配列を返す
    if (imgArr.length === 0) {
      return [];
    }

    // 1枚以上画像があれば，アップロード→idを返す
    const ids = [];
    // 送信用データ生成
    const body = new FormData();
    for (let i = 0; i < imgArr.length; i++) {
      const blob = await fetch(imgArr[i].objectURL).then((r) => r.blob());
      body.append('files[]', blob);
    }
    const url = SERVER_URI + '/Image/AddImage?type=' + router.query.type;
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
      for (let i = 0; i < resList.length; i++) {
        const element = resList[i];
        ids.push(element['id'] as string);
      }
    } else {
      console.error(json['reason']);
    }

    return ids;
  };

  const uploadTeethImage = async (): Promise<string> => {
    const imgData = JSON.parse(router.query.images as string) as Record<
      string,
      null | ImagewithLocation | ImagewithLocation[]
    >;
    if (imgData == null || imgData.teethImage == null) {
      // ない場合は空の配列
      return '';
    }
    const img = imgData.teethImage as ImagewithLocation;

    // 送信用データ生成
    const body = new FormData();
    const blob = await fetch(img.objectURL).then((r) => r.blob());
    body.append('files[]', blob);
    const url = SERVER_URI + '/Image/AddImage?type=' + router.query.type;
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
      for (let i = 0; i < resList.length; i++) {
        const element = resList[i];
        return element['id'] as string;
      }
    } else {
      console.error(json['reason']);
    }

    return '';
  };

  useEffect(() => {
    if (
      router.query.images == null ||
      router.query.type == null ||
      router.query.location == null ||
      router.query.feature == null
    ) {
      alert('情報の取得に失敗しました。\nもう一度やり直してください。');
      router.push('/add');
      return;
    }

    setType(router.query.type as string);
    setImages(JSON.parse(router.query.images as string));
    setLocation(JSON.parse(router.query.location as string));
    setFeature(JSON.parse(router.query.feature as string));
  }, []);

  useEffect(() => {
    if (imageArray == null && images != null) {
      const baseArr =
        images == null || images.otherImages == null
          ? []
          : (images.otherImages as ImagewithLocation[]);
      if (images.teethImage != null) {
        baseArr.unshift(images.teethImage as ImagewithLocation);
      }
      setImageArray(baseArr);
    }
  }, [imageArray, images]);

  const onClickNext = async () => {
    if (await confirm('この内容でよろしいですか？')) {
      // 画像のアップロード
      setLoading(true);
      const img_ids = await uploadImages();
      let img_teeth = '';
      if (router.query.type === 'boar') {
        // 捕獲イノシシ情報の場合は歯列画像も上げる
        img_teeth = await uploadTeethImage();
      }
      const img_ids_feature = img_ids.join(',');

      const feature = JSON.parse(router.query.feature as string) as FeatureBase;
      if (router.query.type === 'boar') {
        (feature.properties as Record<string, unknown>)['写真ID'] = img_ids_feature;
        (feature.properties as Record<string, unknown>)['歯列写真ID'] = img_teeth;
      } else {
        (feature.properties as Record<string, unknown>)['画像ID'] = img_ids_feature;
      }

      const res = await fetch(SERVER_URI + '/Features/AddFeature', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify({
          type: router.query.type,
          feature: feature,
        }),
      });

      const json = await res.json();
      if (res.status === 200) {
        await alert('登録が完了しました。\nご協力ありがとうございました。');
        setLoading(false);
        router.push('/map');
      } else {
        console.error(json['error']);
        await alert('エラーが発生しました。\n' + json['error']);
      }
      setLoading(false);
    }
  };

  const onClickPrev = () => {
    router.push(
      {
        pathname: '/add/info',
        query: {
          type: router.query.type,
          images: router.query.images,
          location: router.query.location,
          feature: router.query.feature,
        },
      },
      '/add/info',
    );
  };

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>
        {to_header_title(type == null ? '' : type)}登録
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>情報に不備がないかご確認ください。</div>
      </div>
      <FeatureViewer
        featureInfo={feature}
        type={type}
        objectURLs={imageArray?.map((f) => f.objectURL)}
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

export default AddConfirmTemplate;
