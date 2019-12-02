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
  }
}

export default MapForAddInfo;
