/* eslint-disable no-invalid-this */
import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import Router from "next/router";
import "leaflet-wms-header";
import "leaflet-easybutton";

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
    pauseEvent: false
  };

  getMyLocBtnIcon = "static/images/map/my_location-24px.svg";
  myLocIcon = "static/images/map/myLoc.png";
  myMap = null;

  componentDidMount() {
    this.map();
  }

  /*
   * TODO: 権限に応じた表示処理
   */
  async getMarkers(map, token, layerId) {
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
      layerId: layerId,
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

    const res = await fetch(
      "https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/GetFeaturesByExtent",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Map-Api-Access-Token": token
        },
        body: JSON.stringify(data)
      }
    );
    const rdata = await res.json();
    console.log(rdata);
    return rdata;
  }

  async addMarkers(map, token) {
    // 取得中にマーカーが消えないように先に情報を取得する
    const overlays = {};

    const me = this;
    const rdata = await this.getMarkers(map, token, 5000008);
    if (rdata["commonHeader"]["resultInfomation"] == "0") {
      const bmarkers = [];
      const features = rdata["data"]["features"];

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const Lat = feature["geometry"]["coordinates"][1];
        const Lng = feature["geometry"]["coordinates"][0];

        const mapMarker = L.marker([Lat, Lng]);
        mapMarker.bindPopup(
          "ID: " + feature["properties"]["ID$"] + "<br>種類: 捕獲いのしし"
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
          console.log();
        });
        bmarkers.push(mapMarker);
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
      if (me.state.markerstate[0]) overlays["捕獲いのしし"].addTo(map);
    }

    const wdata = await this.getMarkers(map, token, 5000009);
    if (wdata["commonHeader"]["resultInfomation"] == "0") {
      const wmarkers = [];
      const features = wdata["data"]["features"];

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const Lat = feature["geometry"]["coordinates"][1];
        const Lng = feature["geometry"]["coordinates"][0];

        const mapMarker = L.marker([Lat, Lng]);
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
          console.log();
        });
        wmarkers.push(mapMarker);
      }
      console.log(wmarkers);

      overlays["ワナ"] = L.layerGroup(wmarkers);
      overlays["ワナ"].addEventListener("add", function(e) {
        if (!me.state.pauseEvent) {
          me.state.markerstate[1] = true;
        }
      });
      overlays["ワナ"].addEventListener("remove", function(e) {
        if (!me.state.pauseEvent) {
          me.state.markerstate[1] = false;
        }
      });
      if (me.state.markerstate[1]) overlays["ワナ"].addTo(map);
    }

    const vdata = await this.getMarkers(map, token, 5000010);
    if (vdata["commonHeader"]["resultInfomation"] == "0") {
      const vmarkers = [];
      const features = vdata["data"]["features"];

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const Lat = feature["geometry"]["coordinates"][1];
        const Lng = feature["geometry"]["coordinates"][0];

        const mapMarker = L.marker([Lat, Lng]);
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
          console.log();
        });
        vmarkers.push(mapMarker);
      }

      console.log(vmarkers);
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
      if (me.state.markerstate[2]) overlays["ワクチン"].addTo(map);
    }

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

    this.state.overlays = overlays;
    this.state.control = L.control.layers(undefined, overlays, {
      collapsed: false
    });
    this.state.control.addTo(map);
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

    const mainLayer = L.tileLayer
      .wmsHeader(
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
      )
      .addTo(this.myMap);

    this.addMarkers(this.myMap, userData.access_token);

    const me = this;

    this.myMap.on("moveend", function(e) {
      me.addMarkers(me.myMap, userData.access_token);
    });

    this.myMap.on("zoomend", function(e) {
      me.addMarkers(me.myMap, userData.access_token);
    });

    L.control.scale().addTo(this.myMap);

    // 現在地ボタン追加

    L.easyButton(
      "<img src=" + this.getMyLocBtnIcon + ">",
      this.onClickSetLocation
    ).addTo(this.myMap);
  }

  render() {
    return (
      <div
        id="map"
        ref={node => {
          this.node = node;
        }}
      ></div>
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
