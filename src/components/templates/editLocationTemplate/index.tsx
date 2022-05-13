import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { FeatureBase } from "../../../types/features";
import { to_header_color } from "../../../utils/header";
import { alert } from "../../../utils/modal";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";
import { LatLngZoom, LatLngZoomCookie } from "../../organisms/mapBase/interface";
import SelectionMap from "../../organisms/selectionMap";

const EditLocationTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [mapDiv, setMapDiv] = useState<JSX.Element | null>(null);
  const [, setCurrentLoc] = useState<LatLngZoom | null>(null);

  useEffect(() => {
    if(router.query.type == null || router.query.detail == null || router.query.id == null || router.query.version == null) {
      alert("情報の取得に失敗しました。");
      router.push('/map');
      return;
    }

    setType(router.query.type as string);

    if (defaultLoc != null) return;

    // prev_locationがある場合はそっちから引っ張る
    if (router.query.prev_location != null) {
      const prevLocation = JSON.parse(router.query.prev_location as string) as LatLngZoom;
      setDefaultLoc(prevLocation);
    } else {  
      // ズーム率はCookieから引っ張ってくる
      let defaultZoom = 17;
      const cookies = parseCookies(null);
      const last_geo = cookies['last_geo'];
      let last_geo_obj = null;
      if (last_geo != null) {
        last_geo_obj = JSON.parse(last_geo) as LatLngZoomCookie;
        defaultZoom = last_geo_obj.zoom;
      }

      // フィーチャーから位置情報を引っ張ってくる。

      const featureInfo = JSON.parse(router.query.detail as string) as FeatureBase;
      const coordinates = featureInfo.geometry.coordinates;
      setDefaultLoc({
        isDefault: false,
        zoom: defaultZoom,
        lat: coordinates[1],
        lng: coordinates[0],
      });
    }
  }, []);

  useEffect(() => {
    if (defaultLoc == null) return;
    setMapDiv(
      <SelectionMap
        location={defaultLoc}
        onCenterChanged={(loc) => setCurrentLoc(loc)}
        isLoaded={false}
      />,
    );
  }, [defaultLoc]);
  
  const onClickNext = () => {
    setCurrentLoc((loc) => {
      router.push(
        {
          pathname: '/edit/image',
          query: {
            id: router.query.id as string,
            type: router.query.type,
            type_srv: router.query.type_srv,
            version: router.query.version,
            detail: router.query.detail,
            location: JSON.stringify(loc)
          },
        },
        '/edit/image',
      );
      return loc;
    });
  };

  const onClickPrev = () => {
    router.push(
      {
        pathname: '/detail',
        query: {
          type: router.query.type,
          type_srv: router.query.type_srv,
          id: router.query.id,
          version: router.query.version
        }
      },
      "/detail"
    );
  };

  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>位置情報編集</Header>
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

export default EditLocationTemplate;