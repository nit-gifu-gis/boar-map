/* eslint-disable no-invalid-this */
import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import Router from "next/router";
import "../../../utils/extwms";
import "leaflet-easybutton";
import "../../../utils/statics";
import EventListener from "react-event-listener";
import UserData from "../../../utils/userData";

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
  myMap = null;

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
            document.getElementById("loading-mark").style.visibility =
              "visible";
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

    // state初期化
    this.state = {
      lat: defaultLat,
      lng: defautlLng,
      zoom: defaultZoom,
      isDefault: isDefault,
      overlays: {},
      markerstate: [true, true, true],
      control: undefined,
      pauseEvent: false,
      retry: 0,
      userData: userData,
      reloadButton: reloadButton,
      isMainMap: false
    };
  }

  componentDidMount() {
    this.map();
  }

  map() {
    const node = this.node;
    this.myMap = L.map(node).setView(
      [this.state.lat, this.state.lng],
      this.state.zoom
    );

    if (this.state.isDefault) {
      // 県庁の場合位置情報を取得する。
      this.getCurrentLocation(this.myMap);
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
    ).addTo(this.myMap);

    this.updateMarkers(this.myMap, userData.access_token);

    const me = this;

    this.myMap.on("moveend", function(e) {
      console.log("map-moveend");
      me.saveMapState(me.myMap);
      me.updateMarkers(me.myMap, userData.access_token);
    });

    this.myMap.on("zoomend", function(e) {
      console.log("map-zoomend");
      me.saveMapState(me.myMap);
      me.updateMarkers(me.myMap, userData.access_token);
    });

    this.myMap.on("resize", function(e) {
      console.log("map-resize");
      me.saveMapState(me.myMap);
      me.updateMarkers(me.myMap, userData.access_token);
    });

    // 拡大縮小ボタン追加
    L.control.scale().addTo(this.myMap);

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
    }).addTo(this.myMap);
  }

  // アイコンのマウスホバー時に出るポップアップを作る
  makePopup(type, id, date) {
    // 大枠
    const div = document.createElement("div");
    div.className = "pop-up";
    // 種類に応じてテキスト変更
    let titleStr = "";
    let dateStr = "";
    switch (type) {
      case "boar":
        titleStr = "捕獲情報";
        dateStr = "捕獲年月日";
        break;
      case "trap":
        titleStr = "わな情報";
        dateStr = "設置年月日";
        break;
      case "vaccine":
        titleStr = "ワクチン情報";
        dateStr = "散布年月日";
        break;
    }
    // タイトル（種類とid）
    titleStr += " - " + id;
    const titleDiv = document.createElement("div");
    titleDiv.className = "pop-up__title";
    titleDiv.appendChild(document.createTextNode(titleStr));
    div.appendChild(titleDiv);
    // 日付
    dateStr += ": ";
    const regexp = new RegExp("(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}) .*", "gu");
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

  getBoar(map, token, me, data) {
    console.log("boar");
    this.state.retry++;
    const overlays = {};
    fetch("/api/JsonService.asmx/GetFeaturesByExtent", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Map-Api-Access-Token": token
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        res
          .json()
          .then(rdata => {
            const bmarkers = [];
            if (rdata["commonHeader"]["resultInfomation"] == "0") {
              const features = rdata["data"]["features"];
              for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const Lat = feature["geometry"]["coordinates"][1];
                const Lng = feature["geometry"]["coordinates"][0];

                const mapMarker = L.marker([Lat, Lng], {
                  icon: this.boarIcon
                });
                mapMarker.bindPopup(
                  this.makePopup(
                    "boar",
                    feature["properties"]["ID$"],
                    feature["properties"]["捕獲年月日"]
                  )
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
                          type: 0
                        }
                      },
                      "/detail"
                    );
                  });
                }
                bmarkers.push(mapMarker);
              }
            }
            overlays["捕獲いのしし"] = L.layerGroup(bmarkers);
            overlays["捕獲いのしし"].addEventListener("add", function(e) {
              if (!me.state.pauseEvent) {
                me.state.markerstate[0] = true;
              }
            });
            overlays["捕獲いのしし"].addEventListener("remove", function(e) {
              if (!me.state.pauseEvent) {
                me.state.markerstate[0] = false;
              }
            });
            this.state.retry = 0;
            this.getTrap(map, token, me, overlays, data);
          })
          .catch(e => {
            if (this.state.retry <= 5) {
              this.getBoar(map, token, me, data);
            }
          });
      })
      .catch(e => {
        if (this.state.retry <= 5) {
          this.getBoar(map, token, me, data);
        }
      });
  }

  getTrap(map, token, me, overlays, data) {
    console.log("trap");
    this.state.retry++;
    data.layerId = TRAP_LAYER_ID;
    fetch("/api/JsonService.asmx/GetFeaturesByExtent", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Map-Api-Access-Token": token
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        res
          .json()
          .then(wdata => {
            const wmarkers = [];
            if (wdata["commonHeader"]["resultInfomation"] == "0") {
              const features = wdata["data"]["features"];
              for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const Lat = feature["geometry"]["coordinates"][1];
                const Lng = feature["geometry"]["coordinates"][0];

                const mapMarker = L.marker([Lat, Lng], {
                  icon: this.trapIcon
                });
                mapMarker.bindPopup(
                  this.makePopup(
                    "trap",
                    feature["properties"]["ID$"],
                    feature["properties"]["設置年月日"]
                  )
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
                          type: 1
                        }
                      },
                      "/detail"
                    );
                  });
                }
                wmarkers.push(mapMarker);
              }
            }
            overlays["わな"] = L.layerGroup(wmarkers);
            overlays["わな"].addEventListener("add", function(e) {
              if (!me.state.pauseEvent) {
                me.state.markerstate[1] = true;
              }
            });
            overlays["わな"].addEventListener("remove", function(e) {
              if (!me.state.pauseEvent) {
                me.state.markerstate[1] = false;
              }
            });
            this.state.retry = 0;
            this.getVaccine(map, token, me, overlays, data);
          })
          .catch(e => {
            if (this.state.retry <= 5) {
              this.getTrap(map, token, me, overlays, data);
            }
          });
      })
      .catch(e => {
        if (this.state.retry <= 5) {
          this.getTrap(map, token, me, overlays, data);
        }
      });
  }

  getVaccine(map, token, me, overlays, data) {
    const userDepartment = this.state.userData.department;

    console.log("vaccine");
    if (userDepartment == "W" || userDepartment == "K") {
      this.state.retry++;
      data.layerId = VACCINE_LAYER_ID;
      fetch("/api/JsonService.asmx/GetFeaturesByExtent", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(data)
      })
        .then(res => {
          res
            .json()
            .then(vdata => {
              const vmarkers = [];
              if (vdata["commonHeader"]["resultInfomation"] == "0") {
                const features = vdata["data"]["features"];

                for (let i = 0; i < features.length; i++) {
                  const feature = features[i];
                  const Lat = feature["geometry"]["coordinates"][1];
                  const Lng = feature["geometry"]["coordinates"][0];

                  const mapMarker = L.marker([Lat, Lng], {
                    icon: this.vaccineIcon
                  });
                  mapMarker.bindPopup(
                    this.makePopup(
                      "vaccine",
                      feature["properties"]["ID$"],
                      feature["properties"]["散布年月日"]
                    )
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
                            type: 2
                          }
                        },
                        "/detail"
                      );
                    });
                  }
                  vmarkers.push(mapMarker);
                }
              }
              overlays["ワクチン"] = L.layerGroup(vmarkers);
              overlays["ワクチン"].addEventListener("add", function(e) {
                if (!me.state.pauseEvent) {
                  me.state.markerstate[2] = true;
                }
              });
              overlays["ワクチン"].addEventListener("remove", function(e) {
                if (!me.state.pauseEvent) {
                  me.state.markerstate[2] = false;
                }
              });
              this.state.retry = 0;
              this.applyMarkers(map, token, me, overlays);
            })
            .catch(e => {
              console.log("E1", e);
              if (this.state.retry <= 5) {
                this.getVaccine(map, token, me, overlays, data);
              }
            });
        })
        .catch(e => {
          console.log("E2", e);
          if (this.state.retry <= 5) {
            this.getVaccine(map, token, me, overlays, data);
          }
        });
    } else {
      this.state.retry = 0;
      this.applyMarkers(map, token, me, overlays);
    }
  }

  applyMarkers(map, token, me, overlays) {
    console.log("applyMarkers");
    // 既存のマーカーを削除
    if (this.state.control != undefined && this.state.overlays != undefined) {
      this.state.control.remove();
      const ovl = this.state.overlays;
      this.state.pauseEvent = true;
      Object.keys(ovl).forEach(function(key) {
        ovl[key].remove();
      });
      this.state.pauseEvent = false;
    }

    if (me.state.markerstate[0]) overlays["捕獲いのしし"].addTo(map);
    if (me.state.markerstate[1]) overlays["わな"].addTo(map);
    if (overlays["ワクチン"] != undefined) {
      if (me.state.markerstate[2]) overlays["ワクチン"].addTo(map);
    }

    this.state.overlays = overlays;
    this.state.control = L.control.layers(undefined, overlays, {
      collapsed: false
    });
    // チェックボックスを配置
    this.state.control.addTo(map);

    // 再読み込みボタンを再配置
    this.state.reloadButton.remove();
    this.state.reloadButton.addTo(map);

    // ローディングのクルクルを消す
    if (document.getElementById("loading-mark") != null) {
      document.getElementById("loading-mark").style.visibility = "hidden";
    }
  }

  updateMarkers(map, token) {
    console.log(this.myMap);
    console.log("updateMarkers");
    const me = this;

    const bounds = map.getBounds();
    const topLat = bounds.getNorth();
    const rightLng = bounds.getEast();
    const bottomLat = bounds.getSouth();
    const leftLng = bounds.getWest();

    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      layerId: BOAR_LAYER_ID,
      inclusion: 1,
      buffer: 100,
      srid: 4326,
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [leftLng, topLat],
            [rightLng, topLat],
            [rightLng, bottomLat],
            [leftLng, bottomLat],
            [leftLng, topLat]
          ]
        ]
      }
    };

    this.getBoar(map, token, me, data);
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
        this.myMap.invalidateSize();
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
