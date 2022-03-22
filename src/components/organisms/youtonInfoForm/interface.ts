import { YoutonFeature } from '../../../types/features';
import { LatLngZoom } from '../mapBase/interface';

export interface YoutonInfoFormProps {
  location: LatLngZoom;
  featureInfo?: YoutonFeature;
}
