import { VaccineFeature } from '@/types/features';

import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface VaccineInfoFormProps {
  location: LatLngZoom;
  featureInfo?: VaccineFeature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
