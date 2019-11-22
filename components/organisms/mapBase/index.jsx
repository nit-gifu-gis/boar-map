import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import "leaflet-wms-header";

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
    const map = L.map("map").setView(
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
        "https://pascali.info-mapping.com/webservices/publicservice/WebmapServiceToken.asmx/WMSService?TENANTID=210005",
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
  }

  render() {
    return <div id="map"></div>;
  }
}

export default MapBase;
