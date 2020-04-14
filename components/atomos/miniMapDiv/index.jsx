import "./miniMapDiv.scss";
import React from "react";
import L from "leaflet";
import "../../../utils/extwms";
import EventListener from "react-event-listener";

class MiniMapDiv extends React.Component {
  myMap = null;

  constructor(props) {
    super(props);
    this.state = {
      lat: this.props.lat,
      lng: this.props.lng,
      zoom: 17,
      myMap: null
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

    L.control.scale().addTo(this.myMap);

    // 十字
    const centerCrossIcon = L.icon({
      iconUrl: "../../../static/images/map/centerCross.svg",
      iconRetinaUrl: "../../../static/images/map/centerCross.svg",
      iconSize: [40, 20],
      iconAnchor: [21, 11]
    });
    const centerCross = L.marker([this.state.lat, this.state.lng], {
      icon: centerCrossIcon,
      zIndexOffset: 400
    }).addTo(this.myMap);
    // ピン
    const centerPinIcon = L.icon({
      iconUrl: "../../../static/images/map/centerPin.svg",
      iconRetinaUrl: "../../../static/images/map/centerPin.svg",
      iconSize: [31, 45],
      iconAnchor: [17, 45]
    });
    const centerPin = L.marker([this.state.lat, this.state.lng], {
      icon: centerPinIcon,
      zIndexOffset: 400
    }).addTo(this.myMap);
  }

  // 画面リサイズで呼ばれる
  handleResize = () => {
    setTimeout(() => {
      this.myMap.invalidateSize();
    }, 200);
  };

  render() {
    return (
      <div
        id="mini_map_div"
        ref={node => {
          this.node = node;
        }}
      ></div>
    );
  }
}

export default MiniMapDiv;
