import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BoarFeatureV2, FeatureBase } from '../../../types/features';
import { LayerType } from '../../../utils/gis';
import { to_header_color } from '../../../utils/header';
import { alert } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import ImageInput from '../../atomos/imageInput';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';

const EditImageTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const maxImageCount = type === 'report' ? 1 : 10;

  const prev_teeth =
    router.query.teethImage == null || router.query.teethImage == ''
      ? null
      : (JSON.parse(router.query.teethImage as string) as ImagewithLocation);
  const prev_other =
    router.query.otherImages == null || router.query.otherImages == ''
      ? null
      : (JSON.parse(router.query.otherImages as string) as ImagewithLocation[]);
  const prev_srv =
    router.query.serverImages == null || router.query.serverImages == ''
      ? null
      : (JSON.parse(router.query.serverImages as string) as Record<string, boolean | string[]>);

  const [teethImage, setTeethImage] = useState<ImagewithLocation | null>(prev_teeth);
  const [otherImages, setOtherImages] = useState<ImagewithLocation[] | null>(prev_other);
  const [serverImages] = useState<Record<string, boolean | string[]> | null>(prev_srv);

  const [isDeleteTeethImage, setIsDeleteTeethImage] = useState(
    prev_srv != null ? prev_srv.isDeleteTeethImage : false,
  );
  const [newImageIds, setNewImageIds] = useState<string[]>([]);

  const [imageKey, setImageKey] = useState<string | null>(null);
  const [feature, setFeature] = useState<FeatureBase | null>(null);

  useEffect(() => {
    if (
      router.query.type == null ||
      router.query.detail == null ||
      router.query.id == null ||
      router.query.version == null
    ) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    }

    // 養豚場情報/豚熱陽性確認情報の場合は画像の登録がないのでスキップする。
    if (router.query.type === '養豚場' || router.query.type === '豚熱陽性高率エリア') {
      let location = router.query.location;
      if (location == null) {
        const feature = JSON.parse(router.query.detail as string) as FeatureBase;
        location = JSON.stringify({
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          zoom: 17,
          isDefault: false,
        });
      }

      const images = JSON.stringify({
        teethImage: teethImage,
        otherImages: otherImages,
      });

      const serverImages = JSON.stringify({
        isDeleteTeethImage: isDeleteTeethImage,
        newServerImages: newImageIds,
      });

      router.push(
        {
          pathname: '/edit/info',
          query: {
            type: router.query.type,
            type_srv: router.query.type_srv,
            id: router.query.id,
            version: router.query.version,
            detail: router.query.detail,
            location: location,
            images: images,
            serverImages: serverImages,
          },
        },
        '/edit/info',
      );
      return;
    }

    const key = router.query.type_srv === 'boar-2' ? '写真ID' : '画像ID';
    const f = JSON.parse(router.query.detail as string) as FeatureBase;
    setType(router.query.type_srv as string);
    setImageKey(key);
    setFeature(f);
    const lst = (f.properties as Record<string, string>)[key];
    setNewImageIds((lst == null ? '' : lst).split(',').filter((e) => e));
  }, []);

  const onClickNext = () => {
    let location = router.query.location;
    if (location == null) {
      const feature = JSON.parse(router.query.detail as string) as FeatureBase;
      location = JSON.stringify({
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        zoom: 17,
        isDefault: false,
      });
    }

    const images = JSON.stringify({
      teethImage: teethImage,
      otherImages: otherImages,
    });

    const serverImages = JSON.stringify({
      isDeleteTeethImage: isDeleteTeethImage,
      newServerImages: newImageIds,
    });

    router.push(
      {
        pathname: '/edit/info',
        query: {
          type: router.query.type,
          type_srv: router.query.type_srv,
          id: router.query.id,
          version: router.query.version,
          detail: router.query.detail,
          location: location,
          images: images,
          serverImages: serverImages,
        },
      },
      '/edit/info',
    );
  };

  const onClickPrev = () => {
    if (router.query.location == null) {
      // 位置情報がない場合はdetailから直接来た場合
      router.push(
        {
          pathname: '/detail',
          query: {
            type: router.query.type,
            type_srv: router.query.type_srv,
            id: router.query.id,
            version: router.query.version,
          },
        },
        '/detail',
      );
    } else {
      // 位置情報がある場合は位置情報選択画面に戻す
      router.push(
        {
          pathname: '/edit/location',
          query: {
            type: router.query.type,
            type_srv: router.query.type_srv,
            id: router.query.id,
            version: router.query.version,
            detail: router.query.detail,
            prev_location: router.query.location,
          },
        },
        '/edit/location',
      );
    }
  };

  const onChangeTeeth = (files: ImagewithLocation[]) => {
    if (files.length === 0) {
      setTeethImage(null);
    } else {
      setTeethImage(files[0]);
    }
  };

  const onChangeOthers = (files: ImagewithLocation[]) => {
    if (files.length === 0) {
      setOtherImages(null);
    } else {
      setOtherImages(files);
    }
  };

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>登録画像編集</Header>
      {imageKey != null && feature != null ? (
        <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
          <div className='mx-[15px] mt-2 text-justify'>画像を登録してください。</div>
          <div className='mx-[15px] mb-2 text-justify'>
            ※ {type == 'boar-2' ? 'その他の' : ''}画像は{maxImageCount}枚まで登録できます。
          </div>
          {type == 'boar-2' ? (
            <div className='box-border w-full px-[15px] py-2'>
              <div className='text-justify text-lg font-bold text-text'>歯列の画像</div>
              <ImageInput
                max_count={1}
                type={type}
                single_file={true}
                onChange={onChangeTeeth}
                objectURLs={teethImage == null ? undefined : [teethImage]}
                imageIDs={
                  serverImages != null && serverImages.isDeleteTeethImage
                    ? undefined
                    : [(feature as BoarFeatureV2).properties.歯列写真ID].filter((e) => e)
                }
                onServerImageDeleted={() => setIsDeleteTeethImage(true)}
              />
            </div>
          ) : (
            <></>
          )}
          <div className='box-border w-full px-[15px] py-2'>
            <div className='text-justify text-lg font-bold text-text'>
              {type == 'boar' ? 'その他の' : ''}画像
              <ImageInput
                max_count={maxImageCount}
                type={type as LayerType}
                single_file={maxImageCount === 1}
                onChange={onChangeOthers}
                objectURLs={otherImages == null ? undefined : otherImages}
                imageIDs={
                  serverImages == null
                    ? ((feature.properties as Record<string, string>)[imageKey] != null
                      ? (feature.properties as Record<string, string>)[imageKey]
                      : ''
                    )
                      .split(',')
                      .filter((e) => e)
                    : (serverImages.newServerImages as string[])
                }
                onServerImageDeleted={(list) => setNewImageIds(list)}
              />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
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

export default EditImageTemplate;
