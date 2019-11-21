import "./mapBase.scss";
import React from "react";
import L from "leaflet";
import "../../../node_modules/leaflet-wms-header";

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
            value: "2e8f941d-442e-457c-8b7e-c9c4e6334a38"
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
