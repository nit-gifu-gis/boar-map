import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { LayerType } from '../../../utils/gis';
import { to_header_color } from '../../../utils/header';
import { alert } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { LatLngZoom, LatLngZoomCookie, Location } from '../../organisms/mapBase/interface';
import SelectionMap from '../../organisms/selectionMap';

const AddLocationTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [mapDiv, setMapDiv] = useState<JSX.Element | null>(null);
  const [currentLoc, setCurrentLoc] = useState<LatLngZoom | null>(null);

  const hasLocation = (t: string, imageInfo: Record<string, unknown>) => {
    return (
      t == 'boar' &&
      imageInfo.teethImage != null &&
      (imageInfo.teethImage as ImagewithLocation).location != null &&
      router.query.prev_location == null
    );
  };

  useEffect(() => {
    if (router.query.images == null || router.query.type == null) {
      alert('情報の取得に失敗しました。\nもう一度やり直してください。');
      router.push('/add');
      return;
    }

    setType(router.query.type as string);

    if (defaultLoc != null) return;

    // prev_locationがある場合はそっちから引っ張る
    if (router.query.prev_location != null) {
      const prevLocation = JSON.parse(router.query.prev_location as string) as LatLngZoom;
      setDefaultLoc(prevLocation);
    } else {
      const imageInfo = JSON.parse(router.query.images as string);

      // ズーム率はCookieから引っ張ってくる
      let defaultZoom = 17;
      const cookies = parseCookies(null);
      const last_geo = cookies['last_geo'];
      let last_geo_obj = null;
      if (last_geo != null) {
        last_geo_obj = JSON.parse(last_geo) as LatLngZoomCookie;
        defaultZoom = last_geo_obj.zoom;
      }

      if (hasLocation(router.query.type as string, imageInfo)) {
        // 画像に位置情報が存在した
        const loc = imageInfo.teethImage.location as Location;
        setDefaultLoc({
          isDefault: false,
          zoom: defaultZoom,
          ...loc,
        });
      } else {
        // 歯列画像がない or 画像に位置情報がない
        // → 最後に表示していたところを中心にする。ない場合はデフォルト位置
        if (last_geo_obj == null) {
          setDefaultLoc({
            isDefault: true,
            zoom: defaultZoom,
            lat: 35.39135,
            lng: 136.722418,
          });
        } else {
          setDefaultLoc({
            isDefault: false,
            ...last_geo_obj,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (defaultLoc == null) return;
    setMapDiv(
      <SelectionMap
        location={defaultLoc}
        onCenterChanged={(loc) => setCurrentLoc(loc)}
        isLoaded={hasLocation(
          router.query.type as string,
          JSON.parse(router.query.images as string),
        )}
      />,
    );
  }, [defaultLoc]);

  const onClickPrev = () => {
    // 画像登録がない2種の場合は2つ前の画面に飛ばす
    if (type === 'youton' || type === 'butanetsu') {
      router.push(
        {
          pathname: '/add',
          query: {
            type: type,
          },
        },
        '/add',
      );
    } else {
      const imgData = JSON.parse(router.query.images as string) as Record<
        string,
        ImagewithLocation | ImagewithLocation[] | null
      >;
      router.push(
        {
          pathname: '/add/image',
          query: {
            type: type,
            teethImage:
              imgData.teethImage == null
                ? undefined
                : JSON.stringify(imgData.teethImage as ImagewithLocation | null),
            otherImages:
              imgData.otherImages == null
                ? undefined
                : JSON.stringify(imgData.otherImages as ImagewithLocation[] | null),
          },
        },
        '/add/image',
      );
    }
  };

  const onClickNext = () => {
    router.push(
      {
        pathname: '/add/info',
        query: {
          type: type,
          images: router.query.images,
          location: JSON.stringify(currentLoc),
        },
      },
      '/add/info',
    );
  };

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>位置情報登録</Header>
      {mapDiv}
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

export default AddLocationTemplate;
