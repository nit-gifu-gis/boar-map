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
import { getColorCode, layerLabels, MAX_MESH_COUNT, SERVER_URI } from '../../../utils/constants';
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
  MeshDataResponse,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from '../../../types/features';
import { useRouter } from 'next/router';
import RoundButton from '../../atomos/roundButton';
import { useButanetsuView } from '../../../hooks/useButanetsuView';
import { useSetRecoilState } from 'recoil';
import { butanetsuViewState } from '../../../states/butanetsuView';
import React from 'react';

const MapBase_: React.FunctionComponent<MapBaseProps> = (props) => {
  const router = useRouter();
  const [, setLoc] = useState<Location | null>(null);
  const [watchPosId, setWatchPosId] = useState<number | null>(null);
  const [overlayList, setOverlayList] = useState<
    Record<string, L.MarkerClusterGroup | L.LayerGroup>
  >({});
  const { currentUser } = useCurrentUser();
  const { currentView } = useButanetsuView();
  const firstRunRef = React.useRef(true);
  const setCurrentButanetsuView = useSetRecoilState(butanetsuViewState);
  const [defaultLoc, setDefaultLoc] = useState<LatLngZoom | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [selfNode, setSelfNode] = useState<HTMLDivElement | null>(null);
  const [myMap, setMyMap] = useState<L.Map | null>(null);
  const [, setControl] = useState<L.Control | null>(null);
  const [featureIDs] = useState<Record<string, string[]>>({});
  const [meshLayers] = useState<Record<string, Record<string, L.LayerGroup>>>({
    vaccine: {},
    hunter: {},
    boar: {}
  });
  const [, setButanetsuLayerID] = useState(-1);
  const [locSearchVisible, setLocSearchVisible] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [searchButtonLabel, setSearchButtonLabel] = useState('検索');
  const [viewSettingVisible, setViewSettingVisible] = useState(false);
  
  const today = new Date();

  const addNewButanetsuMarkers = async (_features: ButanetsuFeature[]) => {
    if (currentView == null) return;

    const { radius, month, style, origin } = currentView;
    const show_date = new Date(origin);
    show_date.setHours(0);
    show_date.setMinutes(0);
    show_date.setSeconds(0);
    show_date.setMonth(show_date.getMonth() - month);

    // ここで描画条件に合わせてマーカーのフィルタを行う
    // style 1: 点と円
    // style 2: 点のみ
    // style 3: 円のみ

    const features = _features.filter((f) => {
      const date = new Date(f.properties.捕獲年月日);
      return show_date <= date;
    });

    const circleMarkers = style !== 2 ? await makeCircleMarkers(radius, features) : [];
    
    const newMarkers = style !== 3 ? features.map((f) => makeMarker(f, '豚熱陽性高率エリア')) : [];
    
    setButanetsuLayerID((id) => {
      const l = overlayList['豚熱陽性高率エリア'] as L.LayerGroup;
      const lg = overlayList['豚熱陽性高率エリア'].getLayer(id) as L.MarkerClusterGroup;
      lg.addLayers(newMarkers);
      circleMarkers.forEach((m) => {
        l.addLayer(m);
      });
      return id;
    });
  };

  useEffect(() => {
    if(firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const renderMarkers = async () => {
      if (myMap == null) return;

      setLoading(true);
      // 既存のマーカーをすべて削除
      const currentButanetsuLayerId = await new Promise<number>((resolve) => {
        setButanetsuLayerID((id) => {
          resolve(id);
          return id;
        });
      });
      const butanetsuLayer = overlayList['豚熱陽性高率エリア'].getLayer(currentButanetsuLayerId) as L.MarkerClusterGroup;

      featureIDs['豚熱陽性高率エリア'] = [];
      const layer = overlayList['豚熱陽性高率エリア'];
      layer.getLayers().forEach((l) => {
        if (l === butanetsuLayer) return;
        layer.removeLayer(l);
      });
      butanetsuLayer.clearLayers();

      // 現在の描画範囲で情報を検索
      const bounds = myMap.getBounds();

      const topLat = bounds.getNorth();
      const rightLng = bounds.getEast();
      const bottomLat = bounds.getSouth();
      const leftLng = bounds.getWest();

      const req_body = {
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [leftLng, topLat],
            [rightLng, topLat],
            [rightLng, bottomLat],
            [leftLng, bottomLat],
            [leftLng, topLat],
          ]],
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
        if (json.豚熱陽性高率エリア != null) {
          // 新しい条件で描画する
          addNewButanetsuMarkers(json.豚熱陽性高率エリア);

          featureIDs['豚熱陽性高率エリア'].push(
            ...json.豚熱陽性高率エリア.map((f) => {
              return `${f.properties.ID$}`;
            }),
          );
        }
      } else {
        alert('情報の取得に失敗しました。');
      }

      setLoading(false);
    };
    renderMarkers();
  }, [currentView]);

  const handleViewSettingsUpdate = () => {
    const range_input = document.getElementById('butanetsu_range') as HTMLInputElement;
    const style_input = document.getElementById('butanetsu_style') as HTMLInputElement;
    const month_input = document.getElementById('butanetsu_month') as HTMLInputElement;
    const date_y_input = document.getElementById('butanetsu_date_y') as HTMLInputElement;
    const date_m_input = document.getElementById('butanetsu_date_m') as HTMLInputElement;
    const date_d_input = document.getElementById('butanetsu_date_d') as HTMLInputElement;

    const range_val = parseInt(range_input.value);
    const style_val = parseInt(style_input.value);
    const month_val = parseInt(month_input.value);
    const date_y_val = parseInt(date_y_input.value);
    const date_m_val = parseInt(date_m_input.value);
    const date_d_val = parseInt(date_d_input.value);

    if (isNaN(range_val) || range_val <= 0) {
      alert('無効な値が入力されました。');
      return;
    }

    if (isNaN(month_val) || month_val <= 0) {
      alert('無効な値が入力されました。');
      return;
    }

    if (isNaN(date_y_val) || date_y_val <= 0) {
      alert('無効な値が入力されました。');
      return;
    }

    if (isNaN(date_m_val) || date_m_val <= 0) {
      alert('無効な値が入力されました。');
      return;
    }

    if (isNaN(date_d_val) || date_d_val <= 0) {
      alert('無効な値が入力されました。');
      return;
    }

    const d = new Date(date_y_val, date_m_val - 1, date_d_val);
    
    setCurrentButanetsuView({
      radius: range_val,
      month: month_val,
      style: style_val,
      origin: d
    });
  };

  const [, setMyLocMarker] = useState<L.Marker | null>(null);
  // let myLocMarker: L.Marker | null = null;

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
        iconSize: new L.Point(30, 30),
      });
    };
  };

  const clusterGroupOption = {
    maxClusterRadius: 40,
  };

  const setupMap = async () => {
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

        const lg = L.layerGroup([mcg]);
        setButanetsuLayerID(lg.getLayerId(mcg));

        overlay['豚熱陽性高率エリア'] = lg;
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

      overlay['ワクチンメッシュ'] = L.layerGroup();
      overlay['ハンターメッシュ'] = L.layerGroup();
      overlay['捕獲いのしし分布'] = L.layerGroup();
    }
    setOverlayList(overlay);
  };

  const formatDate = (date: string) => {
    const regex = new RegExp('(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}).*', 'g');
    const result = regex.exec(date);
    if (result == null) return '日付登録なし';
    else return result[1];
  };

  const markerIcon = (iconUrl: string, label: string) => {
    return L.divIcon({
      iconSize: [0, 0],
      html:
        '<div class="markerDiv">' +
        `<img src="${iconUrl}" class="markerDiv__img" style="${
          !iconUrl.toLowerCase().endsWith('.svg') ? 'width: 20px;' : ''
        }" />` +
        `<div class="markerDiv__title">${label}</div>` +
        '</div>',
    });
  };
  const boarIconLink = '/static/images/icons/boar.svg';
  const trapIconLink = {
    'box': '/static/images/icons/trap-box.svg',
    'tie': '/static/images/icons/trap-tie.svg',
    'gun': '/static/images/icons/trap-gun.svg',
  };
  const vaccineIconLink = '/static/images/icons/vaccine.svg';
  const youtonIconLink = '/static/images/icons/youton.png';
  const butanetsuIconLink = '/static/images/icons/butanetsu.png';
  const reportIconLink = '/static/images/icons/report.png';

  const myLocIcon = L.icon({
    iconUrl: '/images/map/location_marker.svg',
    iconRetinaUrl: '/images/map/location_marker.svg',
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
    setLabelVisible((l) => !l);
  }).setPosition('bottomright');

  const locSearchButton = L.easyButton('<div class="leaflet-button">地点検索</div>', () => {
    setLocSearchVisible((l) => !l);
  }).setPosition('bottomright');

  const viewSettingButton = L.easyButton('<div class="leaflet-button">表示設定</div>', () => {
    setViewSettingVisible((l) => !l);
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

      setLoc((loc) => {
        if (loc == null) {
          return {
            lat: lat,
            lng: lng,
          };
        }

        loc.lat = lat;
        loc.lng = lng;

        return loc;
      });
      setCurrentLocation(true);
    };

    const error = (e: GeolocationPositionError) => {
      console.warn('位置情報取得失敗', e);
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
        coordinates: [[
          [leftLng, topLat],
          [rightLng, topLat],
          [rightLng, bottomLat],
          [leftLng, bottomLat],
          [leftLng, topLat],
        ]],
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
          if (key === '豚熱陽性高率エリア') {
            addNewButanetsuMarkers(newFeatures as ButanetsuFeature[]);
          } else {
            const newMarkers = newFeatures.map((f) => makeMarker(f, key as layerType));
            (overlayList[key] as L.MarkerClusterGroup).addLayers(newMarkers);
          }
        }
      });
    }

    // メッシュデータを取得する
    const resMesh = await fetch(SERVER_URI + "/Mesh/Search", {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Token': getAccessToken(),
      },
      body: JSON.stringify({
        lat: [topLat, bottomLat],
        lng: [leftLng, rightLng]
      }),
    });

    if(resMesh.status === 200) {
      const data = await resMesh.json() as MeshDataResponse;

      const keys = { vaccine: ["vaccineMesh", "ワクチンメッシュ"], hunter: ["hunterMesh", "ハンターメッシュ"], boar: ["boarMesh", "捕獲いのしし分布"] };

      const polygonParam = (key: "vaccine" | "hunter" | "boar", opacity?: number) => {
        if(key != "boar") {
          return {
            color: key == "vaccine" ? '#0288d1' : '#cc56db',
            weight: 2,
            fill: false 
          };
        } else {
          return {
            color: undefined,
            weight: 2,
            fill: true,
            fillColor: '#ff1f0f',
            fillOpacity: opacity ? Math.min(opacity, 0.8) : 0
          };
        }
      };

      // メッシュデータの処理
      Object.keys(data).forEach(_k => {
        const k = _k as "vaccine" | "hunter" | "boar";
        const k0 = keys[k][0];
        const k1 = keys[k][1];

        // 分布表示以外の場合、メッシュが一定数を超えていたら表示しない
        if(data[k].length > MAX_MESH_COUNT && k != "boar")
          data[k] = [];

        if (featureIDs[k0] == null) featureIDs[k0] = [];

        // 各条件に合致する要素を取得する
        const newMeshData = data[k].filter(v=>!featureIDs[k0].includes(v.id));
        const IDs = data[k].map(v=>v.id);
        const deleteMeshIDs = featureIDs[k0].filter(id=>!IDs.includes(id));
        // 新しいメッシュを描画する#d14b02 #65db56
        newMeshData.forEach(v => {
          const po = L.polygon(v.coordinates, polygonParam(k, v.fillOpacity));
          const gr: (L.Marker | L.Polygon)[] = [po];
          if (v.fillOpacity === undefined) {
            const ma = L.marker(po.getBounds().getCenter(), {
              icon: L.divIcon({
                html: '<div style="white-space: nowrap; font-weight: bold; font-size: 1.2em; word-break: keep-all; color: #000; -webkit-text-stroke: 0.5px ' + (k === "vaccine" ? "#d14b02" : "#65db56") + ';">' + (v.name == null ? "" : v.name) + '</div>',
              })
            });
            gr.push(ma);
          }
          const lg = L.layerGroup(gr);

          overlayList[k1].addLayer(lg);
          meshLayers[k][v.id] = lg;
          featureIDs[k0].push(v.id);
        });

        // 検索に引っかからなかったメッシュを削除する
        deleteMeshIDs.forEach(id => {
          const po = meshLayers[k][id];
          if(po != null)
            overlayList[k1].removeLayer(po);

          meshLayers[k][id].remove();
          delete meshLayers[k][id];

          featureIDs[k0].splice(featureIDs[k0].indexOf(id), 1);
        });
      });
    }

    // くるくるを消す
    setLoading(false);
  };

  const makeCircleMarkers = async (
    radius: number,
    features: ButanetsuFeature[],
  ): Promise<L.Circle[]> => {
    const l: L.Circle[] = [];
    features.forEach((feature) => {
      const loc = [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
      ] as LatLngExpression;
      const markers = L.circle(loc, {
        radius: radius * 1000,
        color: '#e33b3b',
        weight: 2,
        fill: true,
        fillColor: '#e33b3b',
        fillOpacity: 0.05,
        opacity: 0.4,
      });
      l.push(markers);
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
        let trapIconUrl = '';
        // わなの種類によってアイコンを変える
        switch (f2.properties.罠の種類) {
          case '箱わな':
            trapIconUrl = trapIconLink.box;
            break;
          case 'くくりわな':
          case '囲いわな':
            // 暫定でくくりわなと囲いわなは同じアイコン
            trapIconUrl = trapIconLink.tie;
            break;
          case '銃猟':
            trapIconUrl = trapIconLink.gun;
            break;
          default:
            // デフォルトは箱罠のアイコン（現在と同じ）
            trapIconUrl = trapIconLink.box;
        }
        icon = markerIcon(trapIconUrl, formatDate(f2.properties.設置年月日));
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
      case '豚熱陽性高率エリア': {
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
    setLoc((loc) => {
      if (!loc?.lat || !loc.lng) {
        if (moveMarker) {
          alert('位置情報の取得ができません。');
        }
        return loc;
      }

      setMyLocMarker((myLocMarker) => {
        if (myLocMarker == null) {
          myLocMarker = L.marker([loc.lat, loc.lng], { icon: myLocIcon });
          try {
            myLocMarker.addTo(myMap);
          } catch {
            /** */
          }
        }

        myLocMarker.setLatLng([loc.lat, loc.lng]);

        return myLocMarker;
      });
      if (moveMarker) {
        myMap.setView([loc.lat, loc.lng], 17);
      }

      return loc;
    });
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
      setLoc((loc) => {
        if (loc == null) {
          return {
            lat: lat,
            lng: lng,
          };
        }

        loc.lat = lat;
        loc.lng = lng;

        return loc;
      });
      setCurrentLocation(false);
    };

    const error = (e: GeolocationPositionError) => {
      console.warn('位置情報取得失敗', e);
    };

    const options = {
      enableHighAccuracy: false, // 高精度の位置情報は利用しない
      timeout: Infinity, // 取得できるまで待つ
      maximumAge: 0, // キャッシュは使わない
    };

    setWatchPosId(navigator.geolocation.watchPosition(success, error, options));
  };

  const stopWatchLocation = () => {
    if (watchPosId != null) {
      navigator.geolocation.clearWatch(watchPosId);
    }
  };

  // メイン地図レイヤー
  const [baseMap] = useState(L.TileLayer.wmsHeader(
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
      attribution: '<a href="https://gifugis.jp/"><span class="copyright">&copy 県域統合型GISぎふ</span></a>',
    },
    [
      {
        header: 'X-Access-Token',
        value: getAccessToken(),
      },
    ],
  ));

  // メイン地図レイヤー
  const [structureMap] = useState(L.TileLayer.wmsHeader(
    SERVER_URI + "/Map/GetImage",
    {
      TENANTID: '21000S',
      version: '1.3.0',
      layers: '999999194,5003069,5003070,15003824,15003830',
      format: 'image/png',
      maxZoom: 18,
      tileSize: 256,
      crs: L.CRS.EPSG3857,
      uppercase: true,
      attribution: '<a href="https://gifugis.jp/"><span class="copyright">&copy 県域統合型GISぎふ</span></a>',
    },
    [
      {
        header: 'X-Access-Token',
        value: getAccessToken(),
      },
    ],
  ));

  // メイン地図レイヤー
  const [satelliteMap] = useState(L.TileLayer.wmsHeader(
    SERVER_URI + "/Map/GetImage",
    {
      TENANTID: '21000S',
      version: '1.3.0',
      layers: '999999600',
      format: 'image/png',
      maxZoom: 18,
      tileSize: 256,
      crs: L.CRS.EPSG3857,
      uppercase: true,
      attribution: '<a href="https://www.jsicorp.jp/"><span class="copyright">&copy 日本スペースイメージング</span></a>',
    },
    [
      {
        header: 'X-Access-Token',
        value: getAccessToken(),
      },
    ],
  ));
  
  const layers = {
    "通常マップ": baseMap,
    "目標物マップ": structureMap,
    //    "衛星写真": satelliteMap
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
      const map = L.map(selfNode, { 
        keyboard: false, 
        layers: [
          baseMap
        ] 
      });
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
    Object.keys(overlayList).forEach(k => {
      if(k != "ハンターメッシュ" 
        && k != "ワクチンメッシュ" 
        && k != "捕獲いのしし分布")
        overlayList[k].addTo(myMap);
    });

    // コントロール追加
    const contrl = L.control.layers(layers, overlayList, {
      collapsed: true,
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

    viewSettingButton.remove();
    viewSettingButton.addTo(myMap);

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
    const type_input = document.getElementById('point_search_type') as HTMLSelectElement | null;
    if (type_input == null) {
      alert('内部エラーが発生しました。');
      return;
    }

    const type = type_input.options[type_input.selectedIndex].value;
    if (type == '市町村名') {
      const text_input = document.getElementById('point_search_text') as HTMLInputElement | null;
      if (text_input == null) {
        alert('内部エラーが発生しました。');
        return;
      }
      
      const text = text_input.value;
      setSearchButtonLabel('検索中...');
      const res = await fetch(SERVER_URI + '/City/Search', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify({
          name: text,
        }),
      });
      const json = await res.json();
      setSearchButtonLabel('検索');
      if (!res.ok) {
        alert(json['error']);
        return;
      }

      const list = json as CityInfo[];
      if (list.length === 0) {
        // 0件の時はエラー
        alert('該当の情報が見つかりませんでした。');
      } else if (list.length === 1) {
        // 1件の時はそのまま場所を変える
        setMyMap((myMap) => {
          if (myMap != null) myMap.setView([list[0].point.lat, list[0].point.lng], myMap.getZoom());
          return myMap;
        });
        setLocSearchVisible(false);
      } else {
        // 2件以上の時は確認ダイアログを出す
        const city = await cityList(list);
        if (city == null) return;
        setMyMap((myMap) => {
          if (myMap != null) myMap.setView([city.point.lat, city.point.lng], myMap.getZoom());
          return myMap;
        });
        setLocSearchVisible(false);
      }
    } else if(type === "緯度・経度（度分秒）" || type === "緯度・経度（度）") {
      // モードごとに緯度経度の計算・チェックを行う
      let lat = 0.0;
      let lng = 0.0;
      if (type === "緯度・経度（度）") {
        // 入力されているかのチェック
        const lat_input = document.getElementById('point_search_lat') as HTMLInputElement | null;
        const lng_input = document.getElementById('point_search_lng') as HTMLInputElement | null;
        if (lat_input == null || lng_input == null) {
          alert('内部エラーが発生しました。');
          return;
        }

        lat = parseFloat(lat_input.value);
        lng = parseFloat(lng_input.value);

        if(Number.isNaN(lat) || Number.isNaN(lng)) {
          alert('不正な形式のデータが入力されました。');
          return;
        }
      } else {
        // 最低限度が入力されているかのチェック＋度分秒から度に変換
        const lat_input_divs = [1, 2, 3].map(v => document.getElementById(`point_search_lat_${v}`) as HTMLInputElement).filter(v=> v != null);
        const lng_input_divs = [1, 2, 3].map(v => document.getElementById(`point_search_lng_${v}`) as HTMLInputElement).filter(v=> v != null);
        if (lat_input_divs.length != 3 || lng_input_divs.length != 3) {
          alert('内部エラーが発生しました。');
          return;
        }

        const lat_inputs = lat_input_divs.map(e => parseFloat(e.value)).map((e, i) => Number.isNaN(e) && i != 0 ? 0.0 : e);
        const lng_inputs = lng_input_divs.map(e => parseFloat(e.value)).map((e, i) => Number.isNaN(e) && i != 0 ? 0.0 : e);

        if(Number.isNaN(lat_inputs[0]) || Number.isNaN(lng_inputs[0])) {
          alert('不正な形式のデータが入力されました。');
          return;
        }

        lat = lat_inputs.reduce((prev, cur, i) => (prev + (cur / Math.pow(60, i))), 0);
        lng = lng_inputs.reduce((prev, cur, i) => (prev + (cur / Math.pow(60, i))), 0);
      }

      const map = await new Promise<L.Map | null>(resolve=> setMyMap(m => {
        resolve(m);
        return m;
      }));
      if(map == null) {
        alert("内部エラーが発生しました。");
        return;
      }

      map.panTo(new L.LatLng(lat, lng));
    } else {
      alert('内部エラーが発生しました。');
      return;
    }
  };

  const [searchMode, setSearchMode] = useState<string>("市町村名");

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
        className='pointer-events-none absolute top-header z-10 w-full'
        style={{ height: mapHeight }}
      >
        <div className='mx-auto flex h-full w-[220px] flex-col-reverse'>
          {locSearchVisible ? (
            <div className={'mb-3 box-border w-full p-1 ' + (searchMode === "市町村名" ? "h-[236px]" : "h-[310px] ")}>
              <div className='pointer-events-auto flex h-full w-full flex-col rounded-xl border-2 border-border bg-border p-2'>
                <div className='mr-1 flex items-center justify-end pb-1'>
                  <div className='flex-1 text-center font-bold'>地点検索</div>
                  <div className='text-center text-lg'>
                    <button type='button' onClick={() => setLocSearchVisible(false)}>
                      ×
                    </button>
                  </div>
                </div>
                <div className='flex flex-col'>
                  <span className='py-1 font-bold'>検索項目</span>
                  <select id='point_search_type' className='w-full pb-1 bg-[#ffffff]' defaultValue={"市町村名"} onChange={(e) => setSearchMode(e.target.value)}>
                    <option>市町村名</option>
                    <option>緯度・経度（度分秒）</option>
                    <option>緯度・経度（度）</option>
                  </select>
                  {searchMode === "市町村名" ? (
                    <>
                      <span className='py-1 font-bold'>検索ワード</span>
                      <input id='point_search_text' type='text' className='w-full' />
                    </>
                  ) : (searchMode === "緯度・経度（度分秒）" ? (
                    <>
                      <span className='py-1 font-bold'>緯度</span>
                      <div className='flex justify-center'>
                        <input id='point_search_lat_1' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">°</span>
                        <input id='point_search_lat_2' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">′</span>
                        <input id='point_search_lat_3' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">″</span>
                      </div>
                      <span className='py-1 font-bold'>経度</span>
                      <div className='flex justify-center'>
                        <input id='point_search_lng_1' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">°</span>
                        <input id='point_search_lng_2' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">′</span>
                        <input id='point_search_lng_3' type='number' className='w-[36px] pl-1' />
                        <span className="w-[16px] text-2xl ml-[2px]">″</span>
                      </div>
                    </>
                  ) : (searchMode === "緯度・経度（度）" ? (
                    <>
                      <span className='py-1 font-bold'>緯度</span>
                      <input id='point_search_lat' type='number' className='w-full h-8 pl-1' />
                      <span className='py-1 font-bold'>経度</span>
                      <input id='point_search_lng' type='number' className='w-full h-8 pl-1' />
                    </>
                  ) : (
                    <>
                      エラー: 不明な選択肢
                    </>
                  )))}
                  <div className='w-full p-4'>
                    <RoundButton
                      color='primary'
                      disabled={searchButtonLabel !== '検索'}
                      onClick={onPointSearchClicked}
                    >
                      {searchButtonLabel}
                    </RoundButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          {labelVisible ? (
            <div className='mb-3 box-border h-[226px] w-full p-1'>
              <div className='pointer-events-auto flex h-full w-full flex-col rounded-xl border-2 border-border bg-[#dddcdc] p-2'>
                <div className='mr-1 flex items-center justify-end pb-1'>
                  <div className='flex-1 text-center font-bold'>凡例</div>
                  <div className='text-center text-lg'>
                    <button type='button' onClick={() => setLabelVisible(false)}>
                      ×
                    </button>
                  </div>
                </div>
                <div>
                  {layerLabels.map((k) => (
                    <div className='flex items-center py-[2px]' key={k.name}>
                      <img src={k.icon} width='24' alt={'Icon of ' + k.name} />
                      <div className='ml-1'>{k.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          {viewSettingVisible ? (
            <div className='mb-3 box-border h-[360px] w-full p-1'>
              <div className='pointer-events-auto flex h-full w-full flex-col rounded-xl border-2 border-border bg-[#dddcdc] p-2'>
                <div className='mr-1 flex items-center justify-end pb-1'>
                  <div className='flex-1 text-center font-bold'>地図表示設定</div>
                  <div className='text-center text-lg'>
                    <button type='button' onClick={() => setViewSettingVisible(false)}>
                    ×
                    </button>
                  </div>
                </div>
                <div>
                  <span className='py-1 font-bold'>豚熱陽性高率エリアの設定</span>
                  <span className='py-1 font-bold'>表示方法</span>
                  <select id='butanetsu_style' className='w-full pb-1 bg-[#ffffff]' defaultValue="点と円">
                    <option value="1">点と円で表示</option>
                    <option value="2">点のみで表示</option>
                    <option value="3">円のみで表示</option>
                  </select>
                  <span className='py-1 font-bold'>基準日</span>
                  <div className='w-full pb-1'>
                    <input id='butanetsu_date_y' type='number' className='w-[48px] h-8 pl-1' defaultValue={today.getFullYear()}/>
                    <span className='px-1'>年</span>
                    <input id='butanetsu_date_m' type='number' className='w-[36px] h-8 pl-1' defaultValue={today.getMonth() + 1} />
                    <span className='px-1'>月</span>
                    <input id='butanetsu_date_d' type='number' className='w-[36px] h-8 pl-1' defaultValue={today.getDate()}/>
                    <span className='px-1'>日</span>
                  </div>
                  <span className='py-1 font-bold'>期間 (月)</span>
                  <input id='butanetsu_month' type='number' className='w-full pb-1 bg-[#ffffff]' defaultValue={currentView?.month} />
                  <span className='py-1 font-bold'>範囲 (km)</span>
                  <input id='butanetsu_range' type='number' className='w-full pb-1 bg-[#ffffff]' defaultValue={currentView?.radius}/>
                  <div className='w-full p-4'>
                    <RoundButton
                      color='primary'
                      onClick={handleViewSettingsUpdate}
                    >
                      設定
                    </RoundButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        className={
          'shadow-3 loading-center absolute z-20 rounded ' + (isLoading ? 'block' : 'hidden')
        }
      >
        <Image src='/images/map/loading.gif' alt='Loading icon' width={33} height={33} />
      </div>
    </div>
  );
};

export default MapBase_;