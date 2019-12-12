import "./mapForAddInfo.scss";
import React from "react";
import L from "leaflet";
import MapBase from "../mapBase";
import AddInfoFooter from "../../molecules/addInfoFooter";
import Router from "next/router";

class MapForAddInfo extends MapBase {
  getMyLocBtnIcon = "../../static/images/map/my_location-24px.svg";
  myLocIcon = "../../static/images/map/myLoc.png";

  map() {
    super.map();
    // 下のon関数の中ではthisが使えないのでコピー
    const mapObj = this.myMap;
    // 十字
    const centerCrossIcon = L.icon({
      iconUrl: "../../static/images/map/centerCross.png",
      iconRetinaUrl: "../../static/images/map/centerCross.png",
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
      iconSize: [60, 120],
      iconAnchor: [31, 84]
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
    mapObj.on("moveend", function(e) {
      centerPin.setLatLng(mapObj.getCenter());
    });
  }

  getMapCenter() {
    return this.myMap.getCenter();
  }

  onClickPrev() {
    Router.push("/add/select");
  }

  onClickNext() {
    const url = "/add/info/" + Router.query.type;
    Router.push(
      {
        pathname: url,
        query: {
          lat: this.myMap.getCenter().lat,
          lng: this.myMap.getCenter().lng
        }
      },
      url
    );
  }

  render() {
    return (
      <div className="mapForAddInfo">
        <div className="__Title">
          <h1>捕獲情報登録</h1>
        </div>
        <div className="__description">
          登録したい地点にピンが立つようにしてください。
        </div>
        <div
          id="mapForAddInfo"
          ref={node => {
            this.node = node;
          }}
        ></div>
        <AddInfoFooter
          prevBind={this.onClickPrev}
          nextBind={this.onClickNext.bind(this)}
        />
      </div>
    );
  }
}

export default MapForAddInfo;
