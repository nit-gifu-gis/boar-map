import { LatLngZoom } from '../mapBase/interface';

export interface SelectionMapProps {
  location: LatLngZoom;
  onCenterChanged(loc: LatLngZoom): void;
  isLoaded?: boolean;
}
