import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface SelectionMapProps {
  location: LatLngZoom;
  onCenterChanged(loc: LatLngZoom): void;
  isLoaded?: boolean;
}
