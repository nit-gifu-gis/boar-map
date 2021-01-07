/* eslint-disable no-invalid-this */
import "./mapBase.scss";
import "./leafletCluster.scss";
import React from "react";
import L from "leaflet";
import Router from "next/router";
import "../../../utils/extwms";
import "leaflet-easybutton";
import "../../../utils/statics";
import EventListener from "react-event-listener";
import UserData from "../../../utils/userData";
import "leaflet.markercluster";

// 現在地マーカー
let locMarker = undefined;

class MapBase extends React.Component {
  boarIcon = L.icon({
    iconUrl: "static/images/icons/boar.svg",
    iconRetinaUrl: "static/images/icons/boar.svg",
    // 縦横比＝285:193 ＝ 1:0.67719 〜 37:25
    iconSize: [37, 25],
    iconAnchor: [16, 13]
  });
  trapIcon = L.icon({
    iconUrl: "static/images/icons/trap.svg",
    iconRetinaUrl: "static/images/icons/trap.svg",
    iconSize: [25, 25],
    iconAnchor: [13, 13]
  });
  vaccineIcon = L.icon({
    iconUrl: "static/images/icons/vaccine.svg",
    iconRetinaUrl: "static/images/icons/vaccine.svg",
    iconSize: [25, 25],
    iconAnchor: [13, 13]
  });

  myLocIcon = "static/images/map/location_marker.svg";

  constructor(props) {
    super(props);
    // アクセストークンを取得
    // ユーザーデータ取得(cookieから持ってくる)
    const userData = UserData.getUserData();

    // 再読み込みボタンを作る
    const reloadButton = L.easyButton({
      id: "reload-button", // an id for the generated button
      position: "topright", // inherited from L.Control -- the corner it goes in
      type: "replace", // set to animate when you're comfy with css
      leafletClasses: true, // use leaflet classes to style the button?
      states: [
        {
          // specify different icons and responses for your button
          stateName: "reload",
          onClick: function(button, map) {
            // ローディングのクルクルを出す
            if (document.getElementById("loading-mark") != null) {
              document.getElementById("loading-mark").style.visibility =
                "visible";
            }
            this.updateMarkers(map, this.state.userData.access_token);
          }.bind(this),
          title: "reload",
          icon: "fa-undo"
        }
      ]
    });

    // もしCookieにlast_xxがあったら読み込む
    let defaultLat = 35.39135;
    let defautlLng = 136.722418;
    let defaultZoom = 17;
    let isDefault = true;
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(value => {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "last_lat") {
          defaultLat = parseFloat(content[1]);
          isDefault = false;
        } else if (content[0] == "last_lng") {
          defautlLng = parseFloat(content[1]);
        } else if (content[0] == "last_zoom") {
          defaultZoom = parseFloat(content[1]);
        }
      });
    }

    // クラスタ設定
    const clusterIconCreate = type => {
      return cluster => {
        const childCount = cluster.getChildCount();
        const c = " marker-cluster-" + type;
        return new L.DivIcon({
          html: "<div><span>" + childCount + "</span></div>",
          className: "marker-cluster" + c,
          iconSize: new L.Point(40, 40)
        });
      };
    };
    const clusterGroupOption = {
      maxClusterRadius: 40
    };

    // state初期化
    this.state = {
      myMap: null,
      lat: defaultLat,
      lng: defautlLng,
      zoom: defaultZoom,
      isDefault: isDefault,
      featureIDs: { boar: [], trap: [], vaccine: [] },
      overlays: {
        捕獲いのしし: L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate("boar"),
          polygonOptions: {
            color: getColorCode("boar")
          }
        }),
        わな: L.markerClusterGroup({
          ...clusterGroupOption,
          iconCreateFunction: clusterIconCreate("trap"),
          polygonOptions: {
            color: getColorCode("trap")
          }
        })
      },
      control: undefined,
      clusterGroup: undefined,
      pauseEvent: false,
      retry: 0,
      userData: userData,
      reloadButton: reloadButton,
      isMainMap: false,
      mapLoading: true,
      featureLoading: true
    };

    // 必要に応じてワクチンレイヤー追加
    if (
      this.state.userData.department === "K" ||
      this.state.userData.department === "W"
    ) {
      this.state.overlays["ワクチン"] = L.markerClusterGroup({
        ...clusterGroupOption,
        iconCreateFunction: clusterIconCreate("vaccine"),
        polygonOptions: {
          color: getColorCode("vaccine")
        }
      });
    }
  }

  componentDidMount() {
    this.map();
  }

  map() {
    const node = this.node;
    this.state.myMap = L.map(node, { keyboard: false }).setView(
      [this.state.lat, this.state.lng],
      this.state.zoom
    );

    if (this.state.isDefault) {
      // 県庁の場合位置情報を取得する。
      this.getCurrentLocation(this.state.myMap);
    }

    const userData = this.state.userData;

    if (this.props.isMainMap != undefined) {
      this.state.isMainMap = this.props.isMainMap;
    }

    const mainLayer = L.TileLayer.wmsHeader(
      "https://pascali.info-mapping.com/webservices/publicservice/WebmapServiceToken.asmx/WMSService?TENANTID=21000S",
      {
        version: "1.3.0",
        layers: "999999194",
        format: "image/png",
        maxZoom: 18,
        tileSize: 256,
        crs: L.CRS.EPSG3857,
        uppercase: true
      },
      [
        {
          header: "X-Map-Api-Access-Token",
          value: userData.access_token
        }
      ]
    ).addTo(this.state.myMap);

    this.updateMarkers(this.state.myMap, userData.access_token);

    const me = this;

    this.state.myMap.on("moveend", function(e) {
      console.log("map-moveend");
      me.saveMapState(me.state.myMap);
      me.updateMarkers(me.state.myMap, userData.access_token);
    });

    this.state.myMap.on("zoomend", function(e) {
      console.log("map-zoomend");
      me.saveMapState(me.state.myMap);
      me.updateMarkers(me.state.myMap, userData.access_token);
    });

    this.state.myMap.on("resize", function(e) {
      console.log("map-resize");
      me.saveMapState(me.state.myMap);
      me.updateMarkers(me.state.myMap, userData.access_token);
    });

    // 拡大縮小ボタン追加
    L.control.scale().addTo(this.state.myMap);

    // 現在地取得ボタンを作成＋追加
    L.easyButton({
      id: "set-location-button",
      position: "topleft",
      type: "replace",
      leafletClasses: true,
      states: [
        {
          // specify different icons and responses for your button
          stateName: "setLocation",
          onClick: this.onClickSetLocation,
          title: "setLocation",
          icon: "fa-location-arrow"
        }
      ]
    }).addTo(this.state.myMap);

    // 各種レイヤー追加
    Object.values(this.state.overlays).forEach(o => o.addTo(this.state.myMap));
    // コントロール追加
    this.state.control = L.control.layers(undefined, this.state.overlays, {
      collapsed: false
    });
    // チェックボックスを配置
    this.state.control.addTo(this.state.myMap);

    // 再読み込みボタンを再配置
    this.state.reloadButton.remove();
    this.state.reloadButton.addTo(this.state.myMap);
  }

  async updateMarkers(map) {
    // 所属を取得
    const userDepartment = this.state.userData.department;
    // 表示範囲を取得
    const bounds = map.getBounds();

    // 各フィーチャーを取得
    try {
      const boars = await this.getFeatures(bounds, BOAR_LAYER_ID);
      const traps = await this.getFeatures(bounds, TRAP_LAYER_ID);

      // まだ描画してないフィーチャーだけ抜き出す
      const newBoars = boars.filter(
        f =>
          !this.state.featureIDs["boar"].find(
            id => id === f["properties"]["ID$"]
          )
      );
      const newTraps = traps.filter(
        f =>
          !this.state.featureIDs["trap"].find(
            id => id === f["properties"]["ID$"]
          )
      );

      // 描画予定フィーチャーのidを描画済みidに追加
      this.state.featureIDs["boar"].push(
        ...newBoars.map(f => f["properties"]["ID$"])
      );
      this.state.featureIDs["trap"].push(
        ...newTraps.map(f => f["properties"]["ID$"])
      );

      // 新規描画するマーカーだけ生成
      const newBoarMarkers = newBoars.map(f => this.makeMarker(f, "boar"));
      const newTrapMarkers = newTraps.map(f => this.makeMarker(f, "trap"));

      // レイヤーグループにマーカー追加
      this.state.overlays["捕獲いのしし"].addLayers(newBoarMarkers);
      this.state.overlays["わな"].addLayers(newTrapMarkers);
    } catch (error) {
      console.error(error);
    }

    // ワクチン
    if (userDepartment == "W" || userDepartment == "K") {
      try {
        const vaccines = await this.getFeatures(bounds, VACCINE_LAYER_ID);
        const newVaccines = vaccines.filter(
          f =>
            !this.state.featureIDs["vaccine"].find(
              id => id === f["properties"]["ID$"]
            )
        );
        this.state.featureIDs["vaccine"].push(
          ...newVaccines.map(f => f["properties"]["ID$"])
        );
        const newVaccineMarkers = newVaccines.map(f =>
          this.makeMarker(f, "vaccine")
        );
        this.state.overlays["ワクチン"].addLayers(newVaccineMarkers);
      } catch (error) {
        console.error(error);
      }
    }

    // くるくるを消す
    if (document.getElementById("loading-mark") != null) {
      document.getElementById("loading-mark").style.visibility = "hidden";
    }
  }

  async getFeatures(bounds, layerId) {
    return new Promise(async (resolve, reject) => {
      // 範囲を取得
      const topLat = bounds.getNorth();
      const rightLng = bounds.getEast();
      const bottomLat = bounds.getSouth();
      const leftLng = bounds.getWest();

      // bodyを作って
      const req_body = {
        layerId: layerId,
        inclusion: 1,
        buffer: 100,
        srid: 4326,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [leftLng, topLat],
            [rightLng, topLat],
            [rightLng, bottomLat],
            [leftLng, bottomLat],
            [leftLng, topLat]
          ]
        }
      };

      // fetch
      try {
        const res = await fetch(
          `${SERVER_URI}/Feature/GetFeaturesByExtent.php`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            mode: "cors",
            credentials: "include",
            body: JSON.stringify(req_body)
          }
        );
        if (res.status === 200) {
          // 通信成功ならfeaturesを返す
          const json = await res.json();
          resolve(json["features"]);
          return;
        } else {
          const json = await res.json();
          reject(json["reason"]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // アイコンのマウスホバー時に出るポップアップを作る
  makePopup(title, date) {
    // 大枠
    const div = document.createElement("div");
    div.className = "pop-up";
    // タイトル
    const titleDiv = document.createElement("div");
    titleDiv.className = "pop-up__title";
    titleDiv.appendChild(document.createTextNode(title));
    div.appendChild(titleDiv);
    // 日付
    let dateStr = "";
    const regexp = new RegExp("(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}) .*", "g");
    const result = regexp.exec(date);
    if (result == null) {
      dateStr += "登録されていません。";
    } else {
      dateStr += result[1];
    }
    const dateDiv = document.createElement("div");
    dateDiv.className = "pop-up__date";
    dateDiv.appendChild(document.createTextNode(dateStr));
    div.appendChild(dateDiv);
    return div;
  }

  // マーカーを作る
  makeMarker(feature, type) {
    // 三項演算子，Formattingのせいで見づらい…
    const icon =
      type === "boar"
        ? this.boarIcon
        : type === "trap"
        ? this.trapIcon
        : type === "vaccine"
        ? this.vaccineIcon
        : undefined;
    const dateLabel =
      type === "boar"
        ? "捕獲年月日"
        : type === "trap"
        ? "設置年月日"
        : type === "vaccine"
        ? "散布年月日"
        : undefined;
    const typeNum =
      type === "boar"
        ? 0
        : type === "trap"
        ? 1
        : type === "vaccine"
        ? 2
        : undefined;

    // 緯度経度
    const lat = feature["geometry"]["coordinates"][1];
    const lng = feature["geometry"]["coordinates"][0];

    // マーカー生成
    const mapMarker = L.marker([lat, lng], {
      icon: icon
    });

    // ポップアップ作成
    mapMarker.bindPopup(
      this.makePopup(dateLabel, feature["properties"][dateLabel])
    );
    mapMarker.on("mouseover", function(e) {
      this.openPopup();
    });
    mapMarker.on("mouseout", function(e) {
      this.closePopup();
    });
    if (this.state.isMainMap) {
      mapMarker.on("click", function(e) {
        Router.push(
          {
            pathname: "/detail",
            query: {
              FeatureID: feature["properties"]["ID$"],
              type: typeNum
            }
          },
          "/detail"
        );
      });
    }

    return mapMarker;
  }

  // 地図のサイズを計算する
  calcMapHeight() {
    // 地図の高さを調整する
    const innerHeight = window.innerHeight;
    const headerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      )
    );
    const footerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--footer-height"
      )
    );
    const mapHeight = innerHeight - headerHeight - footerHeight + 1;
    return mapHeight;
  }

  // 画面リサイズで呼ばれる
  handleResize = () => {
    setTimeout(
      function() {
        const mapHeight = this.calcMapHeight();
        document.getElementById("map").style.height = mapHeight + "px";
        // マップのサイズを確認して修正する
        console.log("handleResize");
        this.state.myMap.invalidateSize();
      }.bind(this),
      200
    );
  };

  // 現在地取得ボタンをクリックしたときの処理
  onClickSetLocation = (btn, map) => {
    this.getCurrentLocation(map, true);
  };

  // 現在地取得関数
  getCurrentLocation(map, alert) {
    if (navigator.geolocation == false) {
      if (alert) {
        alert("現在地を取得できませんでした．");
      }
      return;
    }

    // 取得成功時
    const success = e => {
      // マップを現在地中心で表示
      const lat = e.coords.latitude;
      const lng = e.coords.longitude;
      map.setView([lat, lng], 17);

      // 前に表示されていた現在地マーカを消す
      if (locMarker != undefined) {
        map.removeLayer(locMarker);
      }
      // 現在地にマーカーを置く
      const locMerkerIcon = L.icon({
        iconUrl: this.myLocIcon,
        iconRetinaUrl: this.myLocIcon,
        iconSize: [40, 40],
        iconAnchor: [21, 21]
      });
      locMarker = L.marker([lat, lng], { icon: locMerkerIcon }).addTo(map);
    };

    const error = () => {
      if (alert) {
        alert("現在地を取得できませんでした．");
      }
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }

  // 現在の表示状態（中心座標，ズームレベル）を記録する
  saveMapState(map) {
    if (process.browser) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      document.cookie = `last_lat=${center.lat}; path=/`;
      document.cookie = `last_lng=${center.lng}; path=/`;
      document.cookie = `last_zoom=${zoom}; path=/`;
    }
  }

  // 描画関数
  render() {
    const mapHeight = this.calcMapHeight();
    // 描画する
    return (
      <div>
        <div
          id="map"
          style={{ height: mapHeight }}
          ref={node => {
            this.node = node;
          }}
        >
          <EventListener
            target="window"
            onResize={this.handleResize.bind(this)}
          />
        </div>
        <div id="loading-mark">
          <img src="static/images/map/loading.gif" alt="loading" />
        </div>
      </div>
    );
  }
}

export default MapBase;
