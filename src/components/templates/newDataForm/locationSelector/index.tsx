import { useRouter } from "next/router";
import { InputFormTemplateCommonProps } from "../interfaces";
import { InputFormData, useFormDataParser } from "../../../../utils/form-data";
import FooterAdjustment from "../../../atomos/footerAdjustment";
import RoundButton from "../../../atomos/roundButton";
import Footer from "../../../organisms/footer";
import Header from "../../../organisms/header";
import { to_header_color } from "../../../../utils/header";
import { useCallback, useEffect, useState } from "react";
import { LatLngZoom, LatLngZoomCookie, Location } from "../../../organisms/mapBase/interface";
import SelectionMap from "../../../organisms/selectionMap";
import { parseCookies } from "nookies";

const LocationSelectorTemplate: React.FC<InputFormTemplateCommonProps> = ({ isEditing }) => {
  const router = useRouter();
  const paramParser = useFormDataParser();
  const type = paramParser.currentData.dataType;

  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [mapDiv, setMapDiv] = useState<JSX.Element | null>(null);
  const [currentLoc, setCurrentLoc] = useState<LatLngZoom | null>(null);

  useEffect(() => {
    if (!paramParser.currentData.dataType) {
      alert('情報の取得に失敗しました。');
      router.push('/map');
      return;
    }

    // 地図の初期位置の設定
    if (defaultLoc != null) return;

    // ズーム率はCookieから引っ張ってくる
    let defaultZoom = 17;
    const cookies = parseCookies(null);
    const last_geo = cookies['last_geo'];
    let last_geo_obj = null;
    if (last_geo != null) {
      last_geo_obj = JSON.parse(last_geo) as LatLngZoomCookie;
      defaultZoom = last_geo_obj.zoom;
    }

    const coordinates = paramParser.currentData.inputData.gisData?.geometry?.coordinates ?? [NaN, NaN];
    const isLocationExists = coordinates.filter((e) => e != null && !isNaN(e)).length == 2;
    if (isLocationExists) {
      // ポイント情報が既に存在する場合はその位置を初期位置とする
      const coordinates = paramParser.currentData.inputData.gisData?.geometry?.coordinates ?? [35.39135, 136.722418];
      setDefaultLoc({
        isDefault: false,
        zoom: defaultZoom,
        lat: coordinates[1],
        lng: coordinates[0],
      });
    } else {
      // ポイント情報が取得しない場合に初期位置を決定する。

      // 画像に位置情報が存在する場合はその位置を初期位置とする
      const imageArray = (paramParser.currentData.inputData.teethImageUrls ?? []).concat(paramParser.currentData.inputData.otherImageUrls ?? []);
      let loc: Location | null = null;

      for (const imageInfo of imageArray) {
        if (imageInfo.location != null) {
          loc = imageInfo.location;
          break;
        }
      }

      if(loc != null) {
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
  }, [paramParser.currentData, defaultLoc]);

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

  const onClickPrev = useCallback(() => {
    if (isEditing) {
      router.push(
        {
          pathname: '/detail',
          query: {
            type: paramParser.currentData.editData?.type,
            type_srv: paramParser.currentData.editData?.type_srv,
            id: paramParser.currentData.editData?.id,
            version: paramParser.currentData.editData?.version
          }
        }, 
        '/detail'
      );
    } else {
      if (paramParser.currentData.isImageSkipped) {
        router.push('/add');
      } else {
        router.push('/add/image');
      }
    }
  }, [isEditing]);

  const onClickNext = useCallback(() => {
    if (currentLoc == null)
      return;

    // 現在の入力情報を保存する。
    const newData = JSON.parse(JSON.stringify(paramParser.currentData)) as InputFormData;
    if (!isEditing && !newData.inputData?.gisData) {
      // 新規登録の場合はベースとなるデータを作成
      newData.inputData.gisData = {
        geometry: {
          type: 'Point',
          coordinates: [NaN, NaN]
        },
        properties: {},
        type: 'Feature'
      };
    }

    if (newData?.inputData?.gisData == null)
      return;

    newData.inputData.gisData.geometry.coordinates = [currentLoc.lng, currentLoc.lat];

    paramParser.updateData(newData as InputFormData);
    
    // ページを遷移する
    if (isEditing) {
      if (paramParser.currentData.isImageSkipped) {
        // 作業日報など画像情報が存在しない場合は情報編集ページへ
        router.push('/edit/info');
      } else {
        router.push('/edit/image');
      }
    } else {
      router.push('/add/info');
    }
  }, [currentLoc]);
      
  return (
    <div>
      <Header color={to_header_color(type == null ? '' : type)}>位置情報{isEditing ? '編集' : '登録'}</Header>
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

export default LocationSelectorTemplate;