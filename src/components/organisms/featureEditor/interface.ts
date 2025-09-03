import { FeatureBase } from '@/types/features';

import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface FeatureEditorProps {
  featureInfo?: FeatureBase;
  type: string | null;
  location: LatLngZoom;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
}

export interface FeatureEditorHandler {
  validateData(): Promise<boolean>;
  fetchData(): Promise<FeatureBase | null>;
}
