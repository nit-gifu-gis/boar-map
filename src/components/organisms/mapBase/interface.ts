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