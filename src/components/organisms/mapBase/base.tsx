import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LatLngZoomCookie, Location, LatLngZoom, MapBaseProps } from './interface';
import EventListener from 'react-event-listener';
import L, { LatLngExpression } from 'leaflet';
import { parseCookies, setCookie } from 'nookies';
import '../../../utils/extwms';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import 'leaflet-easybutton';
import 'leaflet.markercluster';
import { getColorCode, SERVER_URI } from '../../../utils/constants';
import { hasReadPermission } from '../../../utils/gis';
import { alert } from '../../../utils/modal';
import { getAccessToken } from '../../../utils/currentUser';
import {
  BoarCommonFeatureV2,
  BoarFeatureV1,
  ButanetsuFeature,
  FeatureBase,
  FeatureExtentResponse,
  layerType,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from '../../../types/features';
import { useRouter } from 'next/router';
import shapefile, { FeatureCollectionWithFilename } from 'shpjs';

// TODO: ハンターメッシュ・ワクチンメッシュ関連の表示
// 右下の凡例とか検索ボタン
// 豚熱陽性確認地点の表示方法変更

const MapBase_: React.FunctionComponent<MapBaseProps> = (props) => {
  const router = useRouter();
  const [loc, setLoc] = useState<Location | null>(null);
  const [watchPosId, setWatchPosId] = useState<number | null>(null);
  const [overlayList, setOverlayList] = useState<Record<string, L.MarkerClusterGroup | L.LayerGroup>>({});
  const { currentUser } = useCurrentUser();
  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [selfNode, setSelfNode] = useState<HTMLDivElement | null>(null);
  const [myMap, setMyMap] = useState<L.Map | null>(null);
  const [, setControl] = useState<L.Control | null>(null);
  const [featureIDs, ] = useState<Record<string, string[]>>({});
  // const [myLocMarker, setMyLocMarker] = useState<L.Marker | null>(null);
  let myLocMarker: L.Marker | null = null;

  // クラスタ設定
  const clusterIconCreate = (
    type: 'boar' | 'trap' | 'vaccine' | 'report' | 'youton' | 'butanetsu',
  ) => {
    return (cluster: L.MarkerCluster) => {
      const childCount = cluster.getChildCount();
      const c = ' marker-cluster-' + type;
      return new L.DivIcon({
        html: '<div><span>' + childCount + '</span></div>',
        className: 'marker-cluster' + c,
        iconSize: new L.Point(40, 40),
      });
    };
  };

  const clusterGroupOption = {
    maxClusterRadius: 40,
  };

  const setupMap = async () => {
    if (loc == null) {
      setLoc({
        lat: 35.39135,
        lng: 136.722418,
      });
    }
  
    const overlay: { [key: string]: L.MarkerClusterGroup | L.LayerGroup } = {};
    if (Object.keys(overlay).length === 0 && currentUser != null) {
      // レイヤーの追加
      if (hasReadPermission('boar', currentUser)) {
        overlay['いのしし捕獲地点'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('boar'),
          polygonOptions: {
            color: getColorCode('boar'),
          },
        });
      }
  
      if (hasReadPermission('trap', currentUser)) {
        overlay['わな設置地点'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('trap'),
          polygonOptions: {
            color: getColorCode('trap'),
          },
        });
      }
  
      if (hasReadPermission('vaccine', currentUser)) {
        overlay['ワクチン散布地点'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('vaccine'),
          polygonOptions: {
            color: getColorCode('vaccine'),
          },
        });
      }
  
      if (hasReadPermission('youton', currentUser)) {
        overlay['養豚場'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('youton'),
          polygonOptions: {
            color: getColorCode('youton'),
          },
        });
      }
  
      if (hasReadPermission('butanetsu', currentUser)) {
        overlay['豚熱陽性確認地点'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('butanetsu'),
          polygonOptions: {
            color: getColorCode('butanetsu'),
          },
        });
      }
  
      if (hasReadPermission('report', currentUser)) {
        overlay['作業日報'] = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('report'),
          polygonOptions: {
            color: getColorCode('report'),
          },
        });
      }
  
      // ワクチンメッシュの読み込み
      //   例外発生時に簡単に外に出られるように処理を関数で囲う
      await (async () => {
        const response = await fetch(SERVER_URI + "/Mesh/Get?type=vaccine", {
          headers: {
            "X-Access-Token": getAccessToken()
          }
        });

        if(!response.ok) {
          console.error(`メッシュ情報取得失敗: HTTP ${response.status}`);
          return;
        }

        const data = await response.blob();
        const buffer = await data.arrayBuffer();

        const shp_r = await shapefile(buffer);

        const polygons: L.Polygon[] = [];

        let featurecollection: FeatureCollectionWithFilename[];
        if((shp_r as FeatureCollectionWithFilename[]).length !== undefined) {
          featurecollection = shp_r as FeatureCollectionWithFilename[];
        } else {
          featurecollection = [shp_r as FeatureCollectionWithFilename];
        }
        featurecollection.forEach(fc => {
          fc.features.forEach(feature => {
            if(feature.geometry.type !== "Polygon") {
              return;
            }
            const coordinates: LatLngExpression[] = [];
            feature.geometry.coordinates[0].forEach(l => {
              coordinates.push([l[1], l[0]]);
            });
            polygons.push(L.polygon(coordinates, {
              color: '#0288d1',
              weight: 2,
              fill: true,
              fillColor: '#0288d1',
              opacity: 0.6 
            }));
          });
        });    
        overlay['ワクチンメッシュ'] = L.layerGroup(polygons);
      })();
  
      // ハンターメッシュの読み込み
      //   例外発生時に簡単に外に出られるように処理を関数で囲う
      await (async () => {
        const response = await fetch(SERVER_URI + "/Mesh/Get?type=hunter", {
          headers: {
            "X-Access-Token": getAccessToken()
          }
        });

        if(!response.ok) {
          console.error(`メッシュ情報取得失敗: HTTP ${response.status}`);
          return;
        }

        const data = await response.blob();
        const buffer = await data.arrayBuffer();

        const shp_r = await shapefile(buffer);

        const polygons: L.Polygon[] = [];

        let featurecollection: FeatureCollectionWithFilename[];
        if((shp_r as FeatureCollectionWithFilename[]).length !== undefined) {
          featurecollection = shp_r as FeatureCollectionWithFilename[];
        } else {
          featurecollection = [shp_r as FeatureCollectionWithFilename];
        }
        featurecollection.forEach(fc => {
          fc.features.forEach(feature => {
            if(feature.geometry.type !== "Polygon") {
              return;
            }
            const coordinates: LatLngExpression[] = [];
            feature.geometry.coordinates[0].forEach(l => {
              coordinates.push([l[1], l[0]]);
            });
            polygons.push(L.polygon(coordinates, {
              color: '#cc56db',
              weight: 2,
              fill: true,
              fillColor: '#cc56db',
              opacity: 0.6 
            }));
          });
        });    
        overlay['ハンターメッシュ'] = L.layerGroup(polygons);
      })();
    }
    setOverlayList(overlay);
  };

  const boarIcon = L.icon({
    iconUrl: '/static/images/icons/boar.svg',
    iconRetinaUrl: '/static/images/icons/boar.svg',
    // 縦横比＝285:193 ＝ 1:0.67719 〜 37:25
    iconSize: [37, 25],
    iconAnchor: [16, 13],
  });
  const trapIcon = L.icon({
    iconUrl: '/static/images/icons/trap.svg',
    iconRetinaUrl: '/static/images/icons/trap.svg',
    iconSize: [25, 25],
    iconAnchor: [13, 13],
  });
  const vaccineIcon = L.icon({
    iconUrl: '/static/images/icons/vaccine.svg',
    iconRetinaUrl: '/static/images/icons/vaccine.svg',
    iconSize: [25, 25],
    iconAnchor: [13, 13],
  });
  const youtonIcon = L.icon({
    iconUrl: '/static/images/icons/youton.png',
    iconRetinaUrl: '/static/images/icons/youton.png',
    iconSize: [25, 25],
    iconAnchor: [13, 13],
  });
  const butanetsuIcon = L.icon({
    iconUrl: '/static/images/icons/butanetsu.png',
    iconRetinaUrl: '/static/images/icons/butanetsu.png',
    iconSize: [25, 25],
    iconAnchor: [13, 13],
  });
  const reportIcon = L.icon({
    iconUrl: '/static/images/icons/report.png',
    iconRetinaUrl: '/static/images/icons/report.png',
    iconSize: [25, 25],
    iconAnchor: [13, 13],
  });

  const myLocIcon = L.icon({
    iconUrl: '/static/images/map/location_marker.svg',
    iconRetinaUrl: '/static/images/map/location_marker.svg',
    iconSize: [40, 40],
    iconAnchor: [21, 21],
  });

  const reloadButton = L.easyButton({
    id: 'reload-button',
    position: 'topright',
    type: 'replace',
    leafletClasses: true,
    states: [
      {
        stateName: 'reload',
        onClick: function () {
          // ローディングのクルクルを出す
          setLoading(true);
          updateMarkers();
        }.bind(this),
        title: 'reload',
        icon: 'fa-undo',
      },
    ],
  });

  const onClickSetLocation = () => {
    setCurrentLocation(true);
  };

  // 初回時に現在地を単発で取得する
  const getFirstCurrentLocation = () => {
    if (navigator.geolocation == null) {
      alert('位置情報を取得することができません。');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (loc == null) return;
      loc.lat = lat;
      loc.lng = lng;
      setCurrentLocation(true);
    };

    const error = (e: GeolocationPositionError) => {
      console.error('位置情報取得失敗', e);
    };

    navigator.geolocation.getCurrentPosition(success, error);
  };

  // 現在の表示状態（中心座標，ズームレベル）を記録する
  const saveMapState = () => {
    const center = myMap?.getCenter();
    const zoom = myMap?.getZoom();
    if (center == null || zoom == null) return;

    const data: LatLngZoomCookie = {
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
    };

    setCookie(null, 'last_geo', JSON.stringify(data));
  };

  const updateMarkers = async () => {
    if (myMap == null) return;
    // くるくるを表示
    setLoading(true);

    // 表示範囲の取得
    const bounds = myMap.getBounds();

    // 各フィーチャーの取得
    const topLat = bounds.getNorth();
    const rightLng = bounds.getEast();
    const bottomLat = bounds.getSouth();
    const leftLng = bounds.getWest();

    const req_body = {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [leftLng, topLat],
          [rightLng, topLat],
          [rightLng, bottomLat],
          [leftLng, bottomLat],
          [leftLng, topLat],
        ],
      },
    };

    const res = await fetch(SERVER_URI + '/Features/GetFeaturesByExtent', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Token': getAccessToken(),
      },
      body: JSON.stringify(req_body),
    });

    if (res.status === 200) {
      const json = (await res.json()) as FeatureExtentResponse;
      Object.keys(json).forEach((key) => {
        if (featureIDs[key] == null) featureIDs[key] = [];

        if (json[key] != null) {
          // 描画されていない要素だけを取り出す

          const v = json[key] as FeatureBase[];

          const newFeatures = v.filter((f) => {
            const id = (f.properties as Record<string, unknown>).ID$;
            const id_str =
              key === 'いのしし捕獲地点'
                ? `${id}-v${(f as BoarCommonFeatureV2 | BoarFeatureV1).version}`
                : `${id}`;
            return !featureIDs[key].find((id_e) => id_e === id_str);
          });

          // 描画予定のものを描画済みリストに追加
          featureIDs[key].push(
            ...newFeatures.map((f) => {
              const id = (f.properties as Record<string, unknown>).ID$;
              const id_str =
                key === 'いのしし捕獲地点'
                  ? `${id}-v${(f as BoarCommonFeatureV2 | BoarFeatureV1).version}`
                  : `${id}`;
              return id_str;
            }),
          );

          // 描画するマーカーの生成
          const newMarkers = newFeatures.map((f) => makeMarker(f, key as layerType));
          (overlayList[key] as L.MarkerClusterGroup).addLayers(newMarkers);
        }
      });
    }

    // くるくるを消す
    setLoading(false);
  };

  const makePopup = (title: string, date: string): HTMLDivElement => {
    // 大枠
    const div = document.createElement('div');
    div.className = 'pop-up';

    // タイトル
    const titleDiv = document.createElement('div');
    titleDiv.className = 'pop-up__title';
    titleDiv.appendChild(document.createTextNode(title));
    div.appendChild(titleDiv);

    // 日付
    let dateStr = '';
    const regex = new RegExp('(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}).*', 'g');
    const result = regex.exec(date);
    if (result == null) {
      dateStr += '登録されていません。';
    } else {
      dateStr += result[1];
    }
    const dateDiv = document.createElement('div');
    dateDiv.className = 'pop-up__date';
    dateDiv.appendChild(document.createTextNode(dateStr));
    div.appendChild(dateDiv);

    return div;
  };

  const makeMarker = (f: FeatureBase, t: layerType): L.Marker => {
    let icon = undefined;
    let dataLabel = '';
    let dataValue = '';
    let ver = '';
    switch (t) {
      case 'いのしし捕獲地点':
        icon = boarIcon;
        dataValue = (f as BoarFeatureV1 | BoarCommonFeatureV2).properties.捕獲年月日;
        ver = `v${(f as BoarFeatureV1 | BoarCommonFeatureV2).version}`;
        dataLabel = '捕獲年月日';
        break;
      case 'わな設置地点':
        icon = trapIcon;
        dataLabel = '設置年月日';
        dataValue = (f as TrapFeature).properties.設置年月日;
        break;
      case 'ワクチン散布地点':
        icon = vaccineIcon;
        dataLabel = '散布年月日';
        dataValue = (f as VaccineFeature).properties.散布年月日;
        break;
      case '作業日報':
        icon = reportIcon;
        dataLabel = '作業年月日';
        dataValue = (f as ReportFeature).properties.作業開始時;
        break;
      case '豚熱陽性確認地点':
        icon = butanetsuIcon;
        dataLabel = '捕獲年月日';
        dataValue = (f as ButanetsuFeature).properties.捕獲年月日;
        break;
      case '養豚場':
        icon = youtonIcon;
        dataLabel = '更新年月日';
        dataValue = (f as YoutonFeature).properties.更新日;
        break;
    }

    const coordinates = f.geometry.coordinates as number[];
    const lat = coordinates[1];
    const lng = coordinates[0];

    const mapMarker = L.marker([lat, lng], {
      icon: icon,
    });

    mapMarker.bindPopup(makePopup(dataLabel, dataValue));

    mapMarker.on('mouseover', () => mapMarker.openPopup());
    mapMarker.on('mouseout', () => mapMarker.closePopup());

    if (props.isMainMap) {
      mapMarker.on('click', () => {
        router.push(
          {
            pathname: '/detail',
            query: {
              id: (f.properties as Record<string, unknown>).ID$ as string,
              version: ver,
              type: t,
            },
          },
          '/detail',
        );
      });
    }

    return mapMarker;
  };

  const setCurrentLocation = (moveMarker: boolean) => {
    if (myMap == null) return;
    if (!loc?.lat || !loc.lng) {
      if (moveMarker) {
        alert('位置情報の取得ができません。');
      }
      return;
    }

    if (myLocMarker == null) {
      myLocMarker = L.marker([loc.lat, loc.lng], { icon: myLocIcon });
      if (myLocMarker == null) return;
      try {
        myLocMarker.addTo(myMap);
      } catch {
        /** */
      }
    }

    myLocMarker.setLatLng([loc.lat, loc.lng]);
    if (moveMarker) {
      myMap.setView([loc.lat, loc.lng], 17);
    }
  };

  const startWatchLocation = () => {
    if (navigator.geolocation == null) {
      alert('位置情報を取得することができません。');
    }

    // 位置情報が取れたときの関数
    const success = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // 表示は行わず，マーカーの移動のみ処理する
      if (loc == null) return;
      loc.lat = lat;
      loc.lng = lng;
      setCurrentLocation(false);
    };

    const error = (e: GeolocationPositionError) => {
      console.error('位置情報取得失敗', e);
    };

    const options = {
      enableHighAccuracy: false, // 高精度の位置情報は利用しない
      timeout: Infinity, // 取得できるまで待つ
      maximumAge: 0, // キャッシュは使わな設置地点い
    };

    setWatchPosId(navigator.geolocation.watchPosition(success, error, options));
  };

  const stopWatchLocation = () => {
    if (watchPosId != null) {
      navigator.geolocation.clearWatch(watchPosId);
    }
  };

  useEffect(() => {
    if (selfNode == null) return;

    if (defaultLoc == null) {
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

    if (myMap == null) {
      const map = L.map(selfNode, { keyboard: false });
      setupMap();
      setMyMap(map);
    }
  }, [selfNode]);

  useEffect(() => {
    if (myMap == null || defaultLoc == null || Object.keys(overlayList).length == 0) return;

    myMap.setView([defaultLoc.lat, defaultLoc.lng], defaultLoc.zoom);

    // デフォルトの場合は位置情報取得
    if (defaultLoc.isDefault) {
      getFirstCurrentLocation();
    }

    // メイン地図レイヤー
    L.TileLayer.wmsHeader(
      'https://pascali.info-mapping.com/webservices/publicservice/WebmapServiceToken.asmx/WMSService?TENANTID=21000S',
      {
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
          header: 'X-Map-Api-Access-Token',
          value: currentUser?.accessToken,
        },
      ],
    ).addTo(myMap);

    myMap.on('moveend', () => {
      // マップが動いたとき
      //   従来はここでzoomとresizeもとっていたが、両方とも終了後にmoveendが呼ばれているためmoveendのみにする。
      saveMapState();
      updateMarkers();
    });

    updateMarkers();

    L.control.scale().addTo(myMap);

    L.easyButton({
      id: 'set-location-button',
      position: 'topleft',
      type: 'replace',
      leafletClasses: true,
      states: [
        {
          // specify different icons and responses for your button
          stateName: 'setLocation',
          onClick: onClickSetLocation,
          title: 'setLocation',
          icon: 'fa-location-arrow',
        },
      ],
    }).addTo(myMap);

    // 各種レイヤー追加
    Object.values(overlayList).forEach((o) => o.addTo(myMap));
    // コントロール追加
    const contrl = L.control.layers(undefined, overlayList, {
      collapsed: false,
    });
    setControl(contrl);
    // チェックボックスを配置
    contrl.addTo(myMap);

    reloadButton.remove();
    reloadButton.addTo(myMap);

    // 位置情報の取得開始
    startWatchLocation();

    return () => {
      // Unmount時に呼ばれるらしい。
      stopWatchLocation();
      myMap?.remove();
      setMyMap(null);
    };
  }, [myMap, defaultLoc, overlayList]);

  // ヘッダー(60px), フッター(70px)を引いて、地図部分のヘッダーサイズを計算する。
  const calcMapHeight = () => {
    return window.innerHeight - 60 - 70;
  };
  const [mapHeight, setMapHeight] = useState(`${calcMapHeight()}px`);

  const onResized = () => {
    setTimeout(() => {
      setMapHeight(`${calcMapHeight()}px`);
      if (myMap != null) myMap.invalidateSize();
    }, 200);
  };

  return (
    <div>
      <div
        className='z-0 w-full overflow-hidden'
        id='map'
        style={{ height: mapHeight }}
        ref={(node) => setSelfNode(node)}
      >
        <EventListener target='window' onResize={onResized.bind(this)} />
      </div>
      <div
        className={
          'shadow-3 loading-center absolute z-20 rounded ' + (isLoading ? 'block' : 'hidden')
        }
      >
        <Image src='/static/images/map/loading.gif' alt='Loading icon' width={33} height={33} />
      </div>
    </div>
  );
};

export default MapBase_;
