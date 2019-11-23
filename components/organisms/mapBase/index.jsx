import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import "leaflet-wms-header";
import "leaflet-easybutton";

// 現在地マーカー
let locMarker = undefined;

class MapBase extends React.Component {
  state = {
    lat: 35.367237,
    lng: 136.637408,
    zoom: 17
  };

  componentDidMount() {
    this.map();
  }

  map() {
    const node = this.node;
    const map = L.map(node).setView(
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
      .addTo(map);

    const mapMarker = L.marker([35.367237, 136.637408]);
    mapMarker.addTo(map);
    mapMarker.bindPopup("Test Location");
    mapMarker.openPopup();
    const baseLayers = {
      test: mainLayer
    };
    const overlays = {
      Marker: mapMarker
    };

    L.control.layers(baseLayers, overlays).addTo(map);
    L.control.scale().addTo(map);

    // 現在地ボタン追加

    L.easyButton(
      "<img src='static/images/map/my_location-24px.svg'>",
      onClickSetLocation
    ).addTo(map);
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
}

export default MapBase;

// 現在地取得ボタンを押した時
const onClickSetLocation = (btn, map) => {
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
      iconUrl: "static/images/map/myLoc.png",
      iconRetinaUrl: "static/images/map/myLoc.png",
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
