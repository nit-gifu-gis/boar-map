import { VaccineFeature } from '../../../types/features';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface VaccineInfoFormProps {
  location: LatLngZoom;
  featureInfo?: VaccineFeature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
