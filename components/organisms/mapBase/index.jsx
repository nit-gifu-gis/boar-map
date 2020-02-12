/* eslint-disable no-invalid-this */
import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import Router from "next/router";
import "../../../utils/extwms";
import "leaflet-easybutton";
import "../../../utils/statics";
import EventListener from "react-event-listener";

// 現在地マーカー
let locMarker = undefined;

class MapBase extends React.Component {
  state = {
    lat: 35.367237,
    lng: 136.637408,
    zoom: 17,
    overlays: {},
    markerstate: [true, true, true],
    control: undefined,
    pauseEvent: false,
    retry: 0
  };

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

  getMyLocBtnIcon = "static/images/map/my_location-24px.svg";
  myLocIcon = "static/images/map/myLoc.png";
  myMap = null;

  componentDidMount() {
    this.map();
  }

  getBoar(map, token, me, data) {
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
                  "ID: " +
                    feature["properties"]["ID$"] +
                    "<br>種類: 捕獲いのしし"
                );
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
                  "ID: " + feature["properties"]["ID$"] + "<br>種類: わな"
                );
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
    const userData = { user_id: "", access_token: "" };

    const r = document.cookie.split(";");

    r.forEach(function(value) {
      const content = value.split("=");
      content[0] = content[0].replace(" ", "");
      if (content[0] == "user_id") {
        userData.user_id = content[1];
      } else if (content[0] == "access_token") {
        userData.access_token = content[1];
      }
    });
    // 本番：ユーザーIDの１文字目からユーザーを識別
    // const userDepartment = userData.user_id.substr(0, 1).toUpperCase();
    // テスト環境：ユーザーIDから識別
    // どうして仕様に則ったユーザーIDじゃないの…
    let userDepartment;
    switch (userData.user_id) {
      case "tyousa":
        userDepartment = "T";
        break;
      case "yuugai":
        userDepartment = "U";
        break;
      case "shityouson":
        userDepartment = "S";
        break;
      case "trap":
        userDepartment = "W";
        break;
      case "pref":
        userDepartment = "K";
        break;
      case "demoino":
        userDepartment = null;
      default:
        userDepartment = userData.user_id.substr(0, 1).toUpperCase();
        break;
    }

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
                    "ID: " + feature["properties"]["ID$"] + "<br>種類: ワクチン"
                  );
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
              if (this.state.retry <= 5) {
                this.getVaccine(map, token, me, overlays, data);
              }
            });
        })
        .catch(e => {
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
    this.state.control.addTo(map);
  }

  updateMarkers(map, token) {
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

  map() {
    const node = this.node;
    this.myMap = L.map(node).setView(
      [this.state.lat, this.state.lng],
      this.state.zoom
    );

    // ユーザーデータ取得(cookieから持ってくる)
    const userData = { user_id: "", access_token: "" };
    const r = document.cookie.split(";");
    r.forEach(function(value) {
      const content = value.split("=");
      content[0] = content[0].replace(" ", "");
      if (content[0] == "user_id") {
        userData.user_id = content[1];
      } else if (content[0] == "access_token") {
        userData.access_token = content[1];
      }
    });

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
      me.updateMarkers(me.myMap, userData.access_token);
    });

    this.myMap.on("zoomend", function(e) {
      me.updateMarkers(me.myMap, userData.access_token);
    });

    L.control.scale().addTo(this.myMap);

    // 現在地ボタン追加

    L.easyButton(
      "<img src=" + this.getMyLocBtnIcon + ">",
      this.onClickSetLocation
    ).addTo(this.myMap);
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
    const mapHeight = innerHeight - headerHeight - footerHeight;
    return mapHeight;
  }

  // 画面リサイズで呼ばれる
  handleResize = () => {
    const mapHeight = this.calcMapHeight();
    document.getElementById("map").style.height = mapHeight + "px";
  };

  // 描画関数
  render() {
    const mapHeight = this.calcMapHeight();
    // 描画する
    return (
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
    );
  }

  // 現在地取得ボタンをクリックしたときの処理
  onClickSetLocation = (btn, map) => {
    if (navigator.geolocation == false) {
      alert("現在地を取得できませんでした．");
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
      alert("現在地を取得できませんでした．");
    };

    navigator.geolocation.getCurrentPosition(success, error);
  };
}

export default MapBase;
