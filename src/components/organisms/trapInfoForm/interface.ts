import { TrapFeature } from '../../../types/features';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface TrapInfoFormProps {
  location: LatLngZoom;
  featureInfo?: TrapFeature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
}
