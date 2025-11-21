import { BoarFeatureV1 } from '@/types/features';

import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface BoarInfov1FormProps {
  location: LatLngZoom;
  featureInfo?: BoarFeatureV1;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
