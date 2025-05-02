import { getAccessToken } from "@/utils/currentUser";
import "@/utils/extwms";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FC, useState } from "react";
import { MapContainer } from "react-leaflet";

export interface MapBaseProps {
  isMainMap: boolean;
}

export interface LatLngZoomCookie extends Location {
  zoom: number;
}

export interface LatLngZoom extends LatLngZoomCookie {
  isDefault: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

const MapCore: FC = () => {
  const [baseMap] = useState(
    L.TileLayer.wmsHeader(
      `https://boarmap-dev.gifu-nct.ac.jp/api/Map/GetImage`,
      {
        TENANTID: "21000S",
        version: "1.3.0",
        layers: "999999194",
        format: "image/png",
        maxZoom: 18,
        tileSize: 256,
        crs: L.CRS.EPSG3857,
        uppercase: true,
        attribution:
          '<a href="https://gifugis.jp/"><span class="copyright">&copy 県域統合型GISぎふ</span></a>',
      },
      [
        {
          header: "X-Access-Token",
          value: getAccessToken(),
        },
      ],
    ),
  );

  return (
    <MapContainer
      zoom={13}
      center={[51.505, -0.09]}
      scrollWheelZoom={true}
      className="z-5 relative h-full w-full overflow-hidden"
      layers={[baseMap]}
    >
      {/*
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                */}
    </MapContainer>
  );
};

export default MapCore;
