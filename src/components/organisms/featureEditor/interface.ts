import { FeatureBase } from '../../../types/features';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface FeatureEditorProps {
  featureInfo?: FeatureBase;
  type: string | null;
  location: LatLngZoom;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
}

export interface FeatureEditorHandler {
  validateData(): Promise<boolean>;
  fetchData(): FeatureBase | null;
}
