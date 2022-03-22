import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FeatureBase } from '../../../types/features';
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
  const [location, setLocation] = useState<LatLngZoom | null>(null);
  const [feature, setFeature] = useState<FeatureBase | null>(null);
  const [imageArray, setImageArray] = useState<ImagewithLocation[] | null>(null);

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
      console.log('register');
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
          <RoundButton color='danger' onClick={onClickNext.bind(this)}>
            登録 &gt;
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default AddConfirmTemplate;
