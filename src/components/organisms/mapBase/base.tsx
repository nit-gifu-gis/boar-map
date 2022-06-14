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
import { getColorCode, layerLabels, SERVER_URI } from '../../../utils/constants';
import { hasReadPermission } from '../../../utils/gis';
import { alert, cityList } from '../../../utils/modal';
import { getAccessToken } from '../../../utils/currentUser';
import {
  BoarCommonFeatureV2,
  BoarFeatureV1,
  ButanetsuFeature,
  CityInfo,
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
import RoundButton from '../../atomos/roundButton';

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
  const [, setButanetsuLayerID] = useState(-1);
  const [locSearchVisible, setLocSearchVisible] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [searchButtonLabel, setSearchButtonLabel] = useState("検索");

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
        const mcg = L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate('butanetsu'),
          polygonOptions: {
            color: getColorCode('butanetsu'),
          },
        });

        const lg =  L.layerGroup([mcg]);
        setButanetsuLayerID(lg.getLayerId(mcg));

        overlay['豚熱陽性確認地点'] = lg;
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


  const formatDate = (date: string) => {
    const regex = new RegExp('(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}).*', 'g');
    const result = regex.exec(date);
    if(result == null)
      return "日付登録なし";
    else 
      return result[1];
  };

  const markerIcon = (iconUrl: string, label: string) => {
    return L.divIcon({
      iconSize: [0, 0],
      html: '<div class="markerDiv">' +
              `<img src="${iconUrl}" class="markerDiv__img" style="${!iconUrl.toLowerCase().endsWith(".svg") ? "width: 25px;" : ""}" />` +
              `<div class="markerDiv__title">${label}</div>` +
            '</div>'
    });
  };
  const boarIconLink = '/static/images/icons/boar.svg';
  const trapIconLink = '/static/images/icons/trap.svg';
  const vaccineIconLink = '/static/images/icons/vaccine.svg';
  const youtonIconLink = '/static/images/icons/youton.png';
  const butanetsuIconLink = '/static/images/icons/butanetsu.png';
  const reportIconLink = '/static/images/icons/report.png';

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

  const labelButton = L.easyButton('<div class="leaflet-button">凡例</div>', () => {
    setLabelVisible(l=>!l);
  }).setPosition('bottomright');

  const locSearchButton = L.easyButton('<div class="leaflet-button">地点検索</div>', () => {
    setLocSearchVisible(l=>!l);
  }).setPosition('bottomright');

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
          if(key === "豚熱陽性確認地点") {
            const asyncTask = async () => {
              const circleMarkers = await makeCircleMarkers(newFeatures as ButanetsuFeature[]);
              setButanetsuLayerID(id => {
                const l = overlayList[key] as L.LayerGroup;
                const lg = overlayList[key].getLayer(id) as L.MarkerClusterGroup;
                lg.addLayers(newMarkers);
                circleMarkers.forEach(m => {
                  l.addLayer(m);
                });
                return id;
              });
            };
            asyncTask();
          } else {
            (overlayList[key] as L.MarkerClusterGroup).addLayers(newMarkers);
          }
        }
      });
    }

    // くるくるを消す
    setLoading(false);
  };

  const makeCircleMarkers = async (features: ButanetsuFeature[]): Promise<L.Circle[]> => {
    const res = await fetch(SERVER_URI + '/Settings/Butanetsu', {
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });
    const settings = await res.json();

    const show_date = new Date();
    show_date.setHours(0);
    show_date.setMinutes(0);
    show_date.setSeconds(0);
    show_date.setMonth(show_date.getMonth() - settings.month);

    const l: L.Circle[] = [];
    features.forEach(feature => {
      const date = new Date(feature.properties.捕獲年月日);
      if(show_date <= date) {
        const loc = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] as LatLngExpression;
        const markers = L.circle(loc, {
          radius: settings.radius * 1000,
          color: "#e33b3b",
          weight: 2,
          fill: true,
          fillColor: "#e33b3b",
          opacity: 0.5
        });
        l.push(markers);
      }
    });
    return l;
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
    let icon: L.DivIcon | undefined = undefined;
    let dataLabel = '';
    let dataValue = '';
    let ver = '';
    switch (t) {
      case 'いのしし捕獲地点': {
        const f1 = f as BoarFeatureV1 | BoarCommonFeatureV2;
        icon = markerIcon(boarIconLink, formatDate(f1.properties.捕獲年月日));
        dataValue = f1.properties.捕獲年月日;
        ver = `v${f1.version}`;
        dataLabel = '捕獲年月日';
        break;
      }
      case 'わな設置地点': {
        const f2 = f as TrapFeature;
        icon = markerIcon(trapIconLink, formatDate(f2.properties.設置年月日));
        dataLabel = '設置年月日';
        dataValue = f2.properties.設置年月日;
        break;
      }
      case 'ワクチン散布地点': {
        const f3 = f as VaccineFeature;
        icon = markerIcon(vaccineIconLink, f3.properties.メッシュNO);
        dataLabel = '散布年月日';
        dataValue = f3.properties.散布年月日;
        break;
      }
      case '作業日報': {
        const f4 = f as ReportFeature;
        icon = markerIcon(reportIconLink, formatDate(f4.properties.作業開始時));
        dataLabel = '作業年月日';
        dataValue = f4.properties.作業開始時;
        break;
      }
      case '豚熱陽性確認地点': {
        const f5 = f as ButanetsuFeature;
        icon = markerIcon(butanetsuIconLink, formatDate(f5.properties.捕獲年月日));
        dataLabel = '捕獲年月日';
        dataValue = f5.properties.捕獲年月日;
        break;
      }
      case '養豚場': {
        const f6 = f as YoutonFeature;
        icon = markerIcon(youtonIconLink, f6.properties.施設名);
        dataLabel = '更新年月日';
        dataValue = f6.properties.更新日;
        break;
      }
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
    if (selfNode == null || currentUser == null) return;

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
  }, [currentUser, selfNode, defaultLoc, myMap]);

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

    locSearchButton.remove();
    locSearchButton.addTo(myMap);

    labelButton.remove();
    labelButton.addTo(myMap);

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

  const onPointSearchClicked = async () => {
    const type_input = document.getElementById("point_search_type") as HTMLSelectElement | null;
    const text_input = document.getElementById("point_search_text") as HTMLInputElement | null;
    if(type_input == null || text_input == null) {
      alert("内部エラーが発生しました。");
      return;
    }

    const type = type_input.options[type_input.selectedIndex].value;
    const text = text_input.value;
    if(type == "市町村名") {
      setSearchButtonLabel("検索中...");
      const res = await fetch(SERVER_URI + "/City/Search", {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken()
        },
        body: JSON.stringify({
          name: text
        })
      });
      const json = await res.json();
      setSearchButtonLabel("検索");
      if(!res.ok) {
        alert(json["error"]);
        return;
      }

      const list = json as CityInfo[];
      if(list.length === 0) {
        // 0件の時はエラー
        alert("該当の情報が見つかりませんでした。");
      } else if(list.length === 1) {
        // 1件の時はそのまま場所を変える
        setMyMap(myMap => {
          if(myMap != null)
            myMap.setView([list[0].point.lat, list[0].point.lng], myMap.getZoom());
          return myMap;
        });
        setLocSearchVisible(false);
      } else {
        // 2件以上の時は確認ダイアログを出す
        const city = await cityList(list);
        if(city == null)
          return;
        setMyMap(myMap => {
          if(myMap != null)
            myMap.setView([city.point.lat, city.point.lng], myMap.getZoom());
          return myMap;
        });
        setLocSearchVisible(false);
      }
    } else {
      alert("内部エラーが発生しました。");
      return;
    }
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
        className='w-full z-10 absolute top-header pointer-events-none'
        style={{ height: mapHeight }}
      >
        <div className='w-[220px] mx-auto h-full flex flex-col-reverse'>
          {locSearchVisible ? (
            <div className='w-full h-[236px] box-border p-1 mb-3'>
              <div className="flex flex-col w-full h-full pointer-events-auto bg-[#dddcdc] rounded-xl border-2 border-border p-2">
                <div className="flex justify-end items-center pb-1 mr-1">
                  <div className="flex-1 text-center font-bold">
                    地点検索（試験中）
                  </div>
                  <div className="text-center text-lg">
                    <button type="button" onClick={() => setLocSearchVisible(false)}>×</button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold py-1">検索対象</span>
                  <select id="point_search_type" className="w-full pb-1">
                    <option>市町村名</option>
                  </select>
                  <span className="font-bold py-1">検索ワード</span>
                  <input id="point_search_text" type="text" className="w-full" />
                  <div className="w-full p-4">
                    <RoundButton color="primary" disabled={searchButtonLabel !== "検索"} onClick={onPointSearchClicked}>
                      {searchButtonLabel}
                    </RoundButton>
                  </div>
                </div>
              </div>
            </div>
          ) : <></>}
          {labelVisible ? (
            <div className='w-full h-[226px] box-border p-1 mb-3'>
              <div className="flex flex-col w-full h-full pointer-events-auto bg-[#dddcdc] rounded-xl border-2 border-border p-2">
                <div className="flex justify-end items-center pb-1 mr-1">
                  <div className="flex-1 text-center font-bold">
                    凡例
                  </div>
                  <div className="text-center text-lg">
                    <button type="button" onClick={() => setLabelVisible(false)}>×</button>
                  </div>
                </div>
                <div>
                  {layerLabels.map(k => (
                    <div className="py-[2px] flex items-center" key={k.name}>
                      <img src={k.icon} width="24" alt={"Icon of " + k.name} />
                      <div className="ml-1">
                        {k.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <></>}
        </div>
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
