import { BoarFeatureV1 } from '../../../types/features';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface BoarInfov1FormProps {
  location: LatLngZoom;
  featureInfo?: BoarFeatureV1;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
