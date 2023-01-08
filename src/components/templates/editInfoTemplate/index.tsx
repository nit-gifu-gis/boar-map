import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useState } from 'react';
import { alert } from '../../../utils/modal';
import { BoarFeatureV2, FeatureBase } from '../../../types/features';
import { to_header_color, to_header_title } from '../../../utils/header';
import FooterAdjustment from '../../atomos/footerAdjustment';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import FeatureEditor from '../../organisms/featureEditor';
import { FeatureEditorHandler } from '../../organisms/featureEditor/interface';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { LatLngZoom } from '../../organisms/mapBase/interface';

const EditInfoTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [images, setImages] = useState<Record<
    string,
    ImagewithLocation | ImagewithLocation[] | null
  > | null>(null);
  const [location, setLocation] = useState<LatLngZoom | null>(null);
  const [feature, setFeature] = useState<FeatureBase | null>(null);
  const [editorRef, setEditorRef] = useState<React.RefObject<FeatureEditorHandler> | null>(null);
  const [imageArray, setImageArray] = useState<ImagewithLocation[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [serverImages, setServerImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (
      router.query.type == null ||
      router.query.id == null ||
      router.query.type_srv == null ||
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
    if (router.query.location == '') {
      router.query.location = undefined;
    }
    if (router.query.location != null) {
      setLocation(JSON.parse(router.query.location as string));
    }

    const feature = router.query.detail != null ? JSON.parse(router.query.detail as string) : null;
    if (router.query.detail != null) {
      setFeature(feature);
    }

    if (editorRef == null) {
      setEditorRef(React.createRef());
    }

    const srvImgs = JSON.parse(router.query.serverImages as string);
    const images = srvImgs['newServerImages'] as string[];
    if (t === 'boar' && !(srvImgs.isDeleteTeethImage as boolean)) {
      images.unshift((feature as BoarFeatureV2).properties.歯列写真ID);
    }

    setServerImages(images.filter((e) => e));
  }, []);

  const onClickPrev = () => {
    if (router.query.type === '養豚場' || router.query.type === '豚熱陽性高率エリア') {
      // 画像入力がない場合は前の画面を飛ばして戻す
      router.push(
        {
          pathname: '/detail',
          query: {
            id: router.query.id,
            version: '',
            type: router.query.type,
          },
        },
        '/detail',
      );
    } else {
      const old_imgs = JSON.parse(router.query.images as string);
      router.push(
        {
          pathname: '/edit/image',
          query: {
            type: router.query.type,
            type_srv: router.query.type_srv,
            id: router.query.id,
            version: router.query.version,
            detail: router.query.detail,
            location: router.query.location,
            serverImages: router.query.serverImages,
            teethImage: JSON.stringify(old_imgs['teethImage']),
            otherImages: JSON.stringify(old_imgs['otherImages']),
          },
        },
        '/edit/image',
      );
    }
  };

  const onClickNext = async () => {
    if (editorRef == null) {
      // 本来は起きないはず
      alert('内部エラーが発生しました。');
      return;
    }
    setLoading(true);

    if (!(await editorRef.current?.validateData())) {
      alert('入力内容にエラーがあります。ご確認ください。');
      setLoading(false);
      return;
    }

    const featureInfo = await editorRef.current?.fetchData();
    setLoading(false);

    router.push(
      {
        pathname: '/edit/confirm',
        query: {
          type: router.query.type,
          type_srv: router.query.type_srv,
          id: router.query.id,
          version: router.query.version,
          detail: JSON.stringify(featureInfo),
          location: router.query.location,
          serverImages: router.query.serverImages,
          images: router.query.images,
        },
      },
      '/edit/confirm',
    );
  };

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

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>
        {to_header_title(type == null ? '' : type)}編集
      </Header>
      {location != null ? (
        <FeatureEditor
          type={type}
          location={location}
          featureInfo={feature == null ? undefined : feature}
          ref={editorRef}
          objectURLs={imageArray == null ? undefined : imageArray}
          imageIds={serverImages == null ? undefined : serverImages}
        />
      ) : (
        <></>
      )}
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={onClickPrev.bind(this)}>
            &lt; 戻る
          </RoundButton>
          <RoundButton color='primary' onClick={onClickNext.bind(this)} disabled={isLoading}>
            {isLoading ? '読み込み中...' : '進む >'}
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default EditInfoTemplate;
