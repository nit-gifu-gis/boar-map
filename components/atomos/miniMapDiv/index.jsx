import "./miniMapDiv.scss";
import React from "react";
import L from "leaflet";
import "../../../utils/extwms";
import { getUserData } from "../../../utils/gis";

class MiniMapDiv extends React.Component {
  constructor(props) {
    super(props);

    // もしCookieにlast_xxがあったら読み込む
    let defaultZoom = 17;
    if (process.browser) {
      const r = document.cookie.split(";");
      r.forEach(value => {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "last_zoom") {
          defaultZoom = parseFloat(content[1]);
        }
      });
    }

    this.state = {
      myMap: null,
      lat: this.props.lat,
      lng: this.props.lng,
      zoom: defaultZoom
    };
  }

  componentDidMount() {
    this.map();
  }

  componentWillUnmount() {
    this.state.myMap.remove();
  }

  map() {
    const node = this.node;
    this.state.myMap = L.map(node, { keyboard: false }).setView(
      [this.state.lat, this.state.lng],
      this.state.zoom
    );

    // ユーザーデータ取得(cookieから持ってくる)
    const userData = getUserData();
    if (!userData) return; // 取得失敗

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
          value: userData.accessToken
        }
      ]
    ).addTo(this.state.myMap);

    L.control.scale().addTo(this.state.myMap);

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
    }).addTo(this.state.myMap);
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
    }).addTo(this.state.myMap);
  }

  // 画面リサイズで呼ばれる
  handleResize = () => {
    setTimeout(() => {
      this.state.myMap.invalidateSize();
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
