import { ButanetsuFeature } from '../../../types/features';
import { LatLngZoom } from '../mapBase/interface';

export interface ButanetsuInfoFormProps {
  location: LatLngZoom;
  featureInfo?: ButanetsuFeature;
}
