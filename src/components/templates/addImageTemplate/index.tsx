import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { to_header_color } from '../../../utils/header';
import { alert } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import ImageInput from '../../atomos/imageInput';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LayerType } from '../../../utils/gis';
import { Location } from '../../organisms/mapBase/interface';

const AddImageTemplate: React.FunctionComponent = () => {
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
  const prev_loc =
    router.query.location == null
      ? null
      : (JSON.parse(router.query.location as string) as Location);

  const [teethImage, setTeethImage] = useState<ImagewithLocation | null>(prev_teeth);
  const [otherImages, setOtherImages] = useState<ImagewithLocation[] | null>(prev_other);

  useEffect(() => {
    const type = router.query.type as string | undefined;
    if (type == null) {
      alert('情報の取得に失敗しました。\nもう一度やり直してください。');
      router.push('/add');
      return;
    }

    // 養豚場情報/豚熱陽性確認情報の場合は画像の登録がないのでスキップする。
    if (type === 'youton' || type === 'butanetsu') {
      router.push(
        {
          pathname: '/add/location',
          query: {
            type: type,
            images: '{}',
          },
        },
        '/add/location',
      );
      return;
    }

    setType(type);
  }, []);

  const onClickPrev = () => {
    // Routerに位置情報が渡されている場合は情報登録画面からの遷移だからそっちに戻す
    if (prev_loc != null) {
      // push to /add/info
      const prevData = {
        teethImage: prev_teeth,
        otherImages: prev_other,
      };
      router.push(
        {
          pathname: '/add/info',
          query: {
            type: type,
            images: JSON.stringify(prevData),
            location: JSON.stringify(prev_loc),
          },
        },
        '/add/info',
      );
    } else {
      router.push(
        {
          pathname: '/add',
          query: {
            type: type,
          },
        },
        '/add',
      );
    }
  };

  const onClickNext = async () => {
    // Routerに位置情報が渡されている場合は情報登録画面からの遷移だからそっちに進める
    const nextData = {
      teethImage: teethImage,
      otherImages: otherImages,
    };
    if (prev_loc != null) {
      router.push(
        {
          pathname: '/add/info',
          query: {
            type: type,
            images: JSON.stringify(nextData),
            location: JSON.stringify(prev_loc),
          },
        },
        '/add/info',
      );
    } else {
      router.push(
        {
          pathname: '/add/location',
          query: {
            type: type,
            images: JSON.stringify(nextData),
          },
        },
        '/add/location',
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
      <Header color={to_header_color(type == null ? '' : type)}>画像登録</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>画像を登録してください。</div>
        <div className='mx-[15px] mt-2 text-justify'>
          ※ {type == 'boar' ? 'その他の' : ''}画像は{maxImageCount}枚まで登録できます。
        </div>
        {type == 'boar' ? (
          <>
            <div className='mx-[15px] mt-2 text-justify'>
              ※ <span className='font-bold'>有害捕獲の場合: </span><br />
              ・ 検体採取個体の歯列写真
            </div>
            <div className='mx-[15px] mb-2 text-justify'>
              ※ <span className='font-bold'>調査捕獲の場合: </span><br />
              ・ 検体採取個体の歯列写真 <br />
              ・ 全捕獲個体のそれぞれ全体の写真
            </div>
          </>
        ) : <></>}
        {type == 'boar' ? (
          <div className='box-border w-full px-[15px] py-2'>
            <div className='text-justify text-lg font-bold text-text'>歯列の画像</div>
            <ImageInput
              max_count={1}
              type={type}
              single_file={true}
              onChange={onChangeTeeth}
              objectURLs={teethImage == null ? undefined : [teethImage]}
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

export default AddImageTemplate;
