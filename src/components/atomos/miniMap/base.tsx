import { useEffect, useState } from 'react';
import { MiniMapProps } from './interface';
import L from 'leaflet';
import { LatLngZoom, LatLngZoomCookie } from '../../organisms/mapBase/interface';
import EventListener from 'react-event-listener';
import { parseCookies } from 'nookies';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';

const MiniMap_: React.FunctionComponent<MiniMapProps> = (props) => {
  const [selfNode, setSelfNode] = useState<HTMLDivElement | null>(null);
  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [myMap, setMyMap] = useState<L.Map | null>(null);

  useEffect(() => {
    return () => {
      myMap?.remove();
    };
  }, []);

  useEffect(() => {
    if (selfNode == null) return;

    if (defaultLoc == null) {
      // propsに位置が渡されている場合はそこにピンを立てて中心にする。
      // それ以外の場合は標準マップと同じ挙動で中心を決める。(いずれもズームはCookieから or 17)
      let defaultZoom = 17;
      const cookies = parseCookies(null);
      const last_geo = cookies['last_geo'];
      if (last_geo != null) {
        const last_geo_obj = JSON.parse(last_geo) as LatLngZoomCookie;
        defaultZoom = last_geo_obj.zoom;
      }

      if (props.lat !== undefined && props.lng !== undefined) {
        setDefaultLoc({
          lat: props.lat,
          lng: props.lng,
          zoom: defaultZoom,
          isDefault: true,
        });
      } else {
        const cookies = parseCookies(null);
        const last_geo = cookies['last_geo'];
        if (last_geo == null) {
          setDefaultLoc({
            lat: 35.39135,
            lng: 136.722418,
            zoom: 17,
            isDefault: true,
          });
        } else {
          const last_geo_obj = JSON.parse(last_geo) as LatLngZoomCookie;
          setDefaultLoc({ ...last_geo_obj, isDefault: false });
        }
      }
    }

    if (myMap == null) {
      setMyMap(L.map(selfNode, { keyboard: false }));
    }
  }, [selfNode]);

  // 十字
  const centerCrossIcon = L.icon({
    iconUrl: '/static/images/map/centerCross.svg',
    iconRetinaUrl: '/static/images/map/centerCross.svg',
    iconSize: [40, 20],
    iconAnchor: [21, 11],
  });
  // ピン
  const centerPinIcon = L.icon({
    iconUrl: '/static/images/map/centerPin.svg',
    iconRetinaUrl: '/static/images/map/centerPin.svg',
    iconSize: [31, 45],
    iconAnchor: [17, 45],
  });

  useEffect(() => {
    if (myMap == null || defaultLoc == null) return;
    myMap.setView([defaultLoc.lat, defaultLoc.lng], defaultLoc.zoom);

    // メイン地図レイヤー
    L.TileLayer.wmsHeader(
      SERVER_URI + "/Map/GetImage",
      {
        TENANTID: '21000S',
        version: '1.3.0',
        layers: '999999194',
        format: 'image/png',
        maxZoom: 18,
        tileSize: 256,
        crs: L.CRS.EPSG3857,
        uppercase: true,
      },
      [
        {
          header: 'X-Access-Token',
          value: getAccessToken(),
        },
      ],
    ).addTo(myMap);

    L.control.scale().addTo(myMap);

    // ピンの追加
    L.marker([defaultLoc.lat, defaultLoc.lng], {
      icon: centerCrossIcon,
      zIndexOffset: 400,
    }).addTo(myMap);

    L.marker([defaultLoc.lat, defaultLoc.lng], {
      icon: centerPinIcon,
      zIndexOffset: 400,
    }).addTo(myMap);
  }, [myMap, defaultLoc]);

  const onResized = () => {
    setTimeout(() => {
      myMap?.invalidateSize();
    }, 200);
  };

  return (
    <div
      className='z-0 my-[10px] box-border h-[200px] w-full overflow-hidden rounded-md border-2 border-solid border-border'
      ref={(node) => {
        setSelfNode(node);
      }}
    >
      <EventListener target='window' onResize={onResized.bind(this)} />
    </div>
  );
};

export default MiniMap_;
