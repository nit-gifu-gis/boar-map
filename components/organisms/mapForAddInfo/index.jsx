import "./mapForAddInfo.scss";
import React from "react";
import L from "leaflet";
import "leaflet-center-cross";
import MapBase from "../mapBase";

class MapForAddInfo extends MapBase {
  getMyLocBtnIcon = "../../static/images/map/my_location-24px.svg";
  myLocIcon = "../../static/images/map/myLoc.png";

  map() {
    super.map();
    // Todo: 一番上のレイヤーに持ってくる
    const centerCross = L.centerCross();
    this.myMap.addLayer(centerCross);
  }

  render() {
    return (
      <div className="mapForAddInfo">
        <div className="__description">
          登録したい地点が地図の中心になるように地図を移動させてください。
        </div>
        <div
          id="map"
          ref={node => {
            this.node = node;
          }}
        ></div>
      </div>
    );
  }
}

export default MapForAddInfo;
