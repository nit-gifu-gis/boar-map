import L from 'leaflet';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';

import { LatLngZoom, LatLngZoomCookie } from '@/components/organisms/mapBase/interface';
import { SERVER_URI } from '@/utils/constants';
import { getAccessToken } from '@/utils/currentUser';

import { MiniMapProps } from './interface';
import '@/utils/extwms';

const MiniMap_: React.FunctionComponent<MiniMapProps> = (props) => {
  const [selfNode, setSelfNode] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selfNode == null) return;

    let defaultLoc: LatLngZoom = {
      lat: 35.39135,
      lng: 136.722418,
      zoom: 17,
      isDefault: true,
    };
    const lastGeo = parseCookies(null)['last_geo'];
    if (lastGeo != null) {
      defaultLoc = { ...(JSON.parse(lastGeo) as LatLngZoomCookie), isDefault: false };
    }
    if (props.lat !== undefined && props.lng !== undefined) {
      defaultLoc = { ...defaultLoc, lat: props.lat, lng: props.lng, isDefault: true };
    }

    const myMap = L.map(selfNode, { keyboard: false });
    myMap.setView([defaultLoc.lat, defaultLoc.lng], defaultLoc.zoom);

    const centerCrossIcon = L.icon({
      iconUrl: '/images/map/centerCross.svg',
      iconRetinaUrl: '/images/map/centerCross.svg',
      iconSize: [40, 20],
      iconAnchor: [21, 11],
    });
    // ピン
    const centerPinIcon = L.icon({
      iconUrl: '/images/map/centerPin.svg',
      iconRetinaUrl: '/images/map/centerPin.svg',
      iconSize: [31, 45],
      iconAnchor: [17, 45],
    });

    L.TileLayer.wmsHeader(
      SERVER_URI + '/Map/GetImage',
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
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResized = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => myMap.invalidateSize(), 200);
    };
    window.addEventListener('resize', onResized);

    return () => {
      window.removeEventListener('resize', onResized);
      clearTimeout(resizeTimer);
      myMap.remove();
    };
  }, [selfNode, props.lat, props.lng]);

  return (
    <div
      className='z-0 my-[10px] box-border h-[200px] w-full overflow-hidden rounded-md border-2 border-solid border-border'
      ref={setSelfNode}
    ></div>
  );
};

export default MiniMap_;
