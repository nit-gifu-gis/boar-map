import { ButanetsuFeature } from '@/types/features';

import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface ButanetsuInfoFormProps {
  location: LatLngZoom;
  featureInfo?: ButanetsuFeature;
}
