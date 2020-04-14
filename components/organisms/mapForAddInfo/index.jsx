import "./mapForAddInfo.scss";
import React from "react";
import L from "leaflet";
import MapBase from "../mapBase";
import Router from "next/router";
import "leaflet-easybutton";
import "../../../public/static/css/global.scss";
import EventListener from "react-event-listener";

class MapForAddInfo extends MapBase {
  myLocIcon = "../../static/images/map/location_marker.svg";

  boarIcon = L.icon({
    iconUrl: "../../static/images/icons/boar.svg",
    iconRetinaUrl: "../../static/images/icons/boar.svg",
    // 縦横比＝285:193 ＝ 1:0.67719 〜 37:25
    iconSize: [37, 25],
    iconAnchor: [16, 13]
  });
  trapIcon = L.icon({
    iconUrl: "../../static/images/icons/trap.svg",
    iconRetinaUrl: "../../static/images/icons/trap.svg",
    iconSize: [25, 25],
    iconAnchor: [13, 13]
  });
  vaccineIcon = L.icon({
    iconUrl: "../../static/images/icons/vaccine.svg",
    iconRetinaUrl: "../../static/images/icons/vaccine.svg",
    iconSize: [25, 25],
    iconAnchor: [13, 13]
  });

  constructor(props) {
    super(props);
    console.log(this.props.lat);
    if (this.props.lat != null && this.props.lng != null) {
      console.log("check");
      this.state.lat = this.props.lat;
      this.state.lng = this.props.lng;
    }
  }

  map() {
    super.map();
    // 下のon関数の中ではthisが使えないのでコピー
    const mapObj = this.myMap;
    // 十字
    const centerCrossIcon = L.icon({
      iconUrl: "../../static/images/map/centerCross.svg",
      iconRetinaUrl: "../../static/images/map/centerCross.svg",
      iconSize: [40, 20],
      iconAnchor: [21, 11]
    });
    const centerCross = L.marker(mapObj.getCenter(), {
      icon: centerCrossIcon,
      zIndexOffset: 400
    }).addTo(mapObj);
    // ピン
    const centerPinIcon = L.icon({
      iconUrl: "../../static/images/map/centerPin.svg",
      iconRetinaUrl: "../../static/images/map/centerPin.svg",
      iconSize: [31, 45],
      iconAnchor: [17, 45]
    });
    const centerPin = L.marker(mapObj.getCenter(), {
      icon: centerPinIcon,
      zIndexOffset: 400
    }).addTo(mapObj);
    // ピンを動かしている間、ピンを少し浮かせる
    mapObj.on("move", function(e) {
      const point = mapObj.latLngToLayerPoint(mapObj.getCenter()); // 中心を直交座標系に変換
      const upperCenter = mapObj.layerPointToLatLng([point.x, point.y - 20]); // 中心の少し上を直交座標系で求めて緯度経度に戻す

      // 地図の動きに合わせてピンを動かす
      centerPin.setLatLng(upperCenter);
      centerCross.setLatLng(mapObj.getCenter());
    });
    // 動かし終わったらピンを戻す
    mapObj.on(
      "moveend",
      function(e) {
        const center = mapObj.getCenter();
        centerPin.setLatLng(center);
        // 親コンポーネントにセンターを送る
        this.props.saveCenterMethod(center);
      }.bind(this)
    );
  }

  getMapCenter() {
    return { lat: this.state.lat, lng: this.state.lng };
  }

  // 画面リサイズで呼ばれる
  handleResize = () => {
    setTimeout(
      function() {
        console.log("tests");
        this.myMap.invalidateSize();
      }.bind(this),
      200
    );
  };

  render() {
    return (
      <div className="mapForAddInfo">
        <div className="description">
          登録したい地点にピンが立つようにしてください。
        </div>
        <div className="mapForAddInfoDiv">
          <div
            id="mapForAddInfo"
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
            <img src="../../static/images/map/loading.gif" alt="loading" />
          </div>
        </div>
      </div>
    );
  }
}

export default MapForAddInfo;
