import { YoutonFeature } from '@/types/features';

import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface YoutonInfoFormProps {
  location: LatLngZoom;
  featureInfo?: YoutonFeature;
}
