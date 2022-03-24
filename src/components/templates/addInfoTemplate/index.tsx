import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useState } from 'react';
import { FeatureBase } from '../../../types/features';
import { to_header_color, to_header_title } from '../../../utils/header';
import { alert } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import FeatureEditor from '../../organisms/featureEditor';
import { FeatureEditorHandler } from '../../organisms/featureEditor/interface';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { LatLngZoom } from '../../organisms/mapBase/interface';

const AddInfoTemplate: React.FunctionComponent = () => {
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

  useEffect(() => {
    if (router.query.images == null || router.query.type == null || router.query.location == null) {
      alert('情報の取得に失敗しました。\nもう一度やり直してください。');
      router.push('/add');
      return;
    }
    setType(router.query.type as string);
    setImages(JSON.parse(router.query.images as string));
    setLocation(JSON.parse(router.query.location as string));

    if (router.query.feature != null) {
      setFeature(JSON.parse(router.query.feature as string));
    }

    if (editorRef == null) {
      setEditorRef(React.createRef());
    }
  }, []);

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
        pathname: '/add/confirm',
        query: {
          type: router.query.type,
          images: router.query.images,
          location: router.query.location,
          feature: JSON.stringify(featureInfo),
        },
      },
      '/add/confirm',
    );
  };

  const onClickPrev = () => {
    router.push(
      {
        pathname: '/add/location',
        query: {
          type: router.query.type,
          images: router.query.images,
          prev_location: router.query.location,
        },
      },
      '/add/location',
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
        {to_header_title(type == null ? '' : type)}登録
      </Header>
      {location != null ? (
        <FeatureEditor
          type={type}
          location={location}
          featureInfo={feature == null ? undefined : feature}
          ref={editorRef}
          objectURLs={imageArray == null ? undefined : imageArray}
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

export default AddInfoTemplate;
