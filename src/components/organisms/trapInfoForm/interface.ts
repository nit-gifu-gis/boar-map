import { TrapFeature } from '@/types/features';

import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface TrapInfoFormProps {
  location: LatLngZoom;
  featureInfo?: TrapFeature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
