import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface InfoFormProps {
  location: LatLngZoom;
  featureInfo?: Feature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
