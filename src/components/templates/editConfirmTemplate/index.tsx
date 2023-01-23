import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BoarFeatureV2, FeatureBase } from '../../../types/features';
import { to_header_color, to_header_title } from '../../../utils/header';
import FooterAdjustment from '../../atomos/footerAdjustment';
import { alert, confirm } from '../../../utils/modal';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import FeatureViewer from '../../organisms/featureViewer';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';

const EditConfirmTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [type, setType] = useState<string | null>('');
  const [images, setImages] = useState<Record<
    string,
    ImagewithLocation | ImagewithLocation[] | null
  > | null>(null);
  const [feature, setFeature] = useState<FeatureBase | null>(null);
  const [imageArray, setImageArray] = useState<ImagewithLocation[] | null>(null);

  const [serverImages, setServerImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (
      router.query.type == null ||
      router.query.id == null ||
      router.query.version == null ||
      router.query.detail == null ||
      router.query.location == null ||
      router.query.images == null ||
      router.query.serverImages == null
    ) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    }

    let t = router.query.type_srv as string;
    if (t === 'boar-1') {
      t = 'boar-old';
    } else if (t === 'boar-2') {
      t = 'boar';
    }

    setType(t);
    setImages(JSON.parse(router.query.images as string));
    const f = router.query.detail != null ? JSON.parse(router.query.detail as string) : null;
    setFeature(f);

    const srvImgs = JSON.parse(router.query.serverImages as string);
    const imgs = srvImgs['newServerImages'] as string[];
    if (t === 'boar' && !(srvImgs.isDeleteTeethImage as boolean)) {
      imgs.unshift((f as BoarFeatureV2).properties.歯列写真ID);
    }

    setServerImages(imgs.filter((e) => e));
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
    const url =
      SERVER_URI +
      '/Image/AddImage?type=' +
      ((router.query.type_srv as string).startsWith('boar-') ? 'boar' : router.query.type_srv);
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
    const url =
      SERVER_URI +
      '/Image/AddImage?type=' +
      ((router.query.type_srv as string).startsWith('boar-') ? 'boar' : router.query.type_srv);
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

  const onClickPrev = () => {
    router.push(
      {
        pathname: '/edit/info',
        query: {
          type: router.query.type,
          type_srv: router.query.type_srv,
          id: router.query.id,
          version: router.query.version,
          detail: router.query.detail,
          location: router.query.location,
          images: router.query.images,
          serverImages: router.query.serverImages,
        },
      },
      '/edit/info',
    );
  };

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

  const onClickNext = async () => {
    if (await confirm('この内容でよろしいですか？')) {
      // 削除ボタンを押された画像の削除
      const srvImgs = JSON.parse(router.query.serverImages as string);
      const feature = JSON.parse(router.query.detail as string) as FeatureBase;
      if (router.query.type_srv === 'boar-2' && srvImgs.isDeleteTeethImage) {
        // 捕獲イノシシ情報の場合は歯列画像も削除する
        await deleteImage((feature.properties as Record<string, unknown>)['歯列写真ID'] as string);
      }

      const currentList = (
        (feature.properties as Record<string, unknown>)[
          router.query.type_srv === 'boar-2' ? '写真ID' : '画像ID'
        ] as string
      )
        .split(',')
        .filter((e) => e);
      const remainList = currentList.filter((v) =>
        (srvImgs.newServerImages as string[]).includes(v),
      );
      const deleteList = currentList.filter((v) => !remainList.includes(v));
      await Promise.all(deleteList.map((id) => deleteImage(id)));

      // 画像のアップロード
      setLoading(true);
      const img_ids = await uploadImages();
      let img_teeth = '';
      if (router.query.type_srv === 'boar-2') {
        // 捕獲イノシシ情報の場合は歯列画像も上げる
        if (!srvImgs.isDeleteTeethImage) {
          img_teeth = (feature.properties as Record<string, unknown>)['歯列写真ID'] as string;
        }
        const t = await uploadTeethImage();
        if (t != '') img_teeth = t;
      }
      const register_imgs = remainList.concat(img_ids).filter((e) => e);
      const img_ids_feature = register_imgs.join(',');

      if (router.query.type_srv === 'boar-2') {
        (feature.properties as Record<string, unknown>)['写真ID'] = img_ids_feature;
        (feature.properties as Record<string, unknown>)['歯列写真ID'] = img_teeth;
      } else {
        (feature.properties as Record<string, unknown>)['画像ID'] = img_ids_feature;
      }

      const res = await fetch(SERVER_URI + '/Features/UpdateFeature', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify({
          type: router.query.type_srv,
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

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>
        {to_header_title(type == null ? '' : type)}編集
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>情報に不備がないかご確認ください。</div>
      </div>
      <FeatureViewer
        featureInfo={feature}
        type={type}
        objectURLs={imageArray?.map((f) => f.objectURL)}
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

export default EditConfirmTemplate;
