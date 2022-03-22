import { ReportFeature } from '../../../types/features';
import { ImagewithLocation } from '../../atomos/imageInput/interface';
import { LatLngZoom } from '../mapBase/interface';

export interface ReportInfoFormProps {
  location: LatLngZoom;
  featureInfo?: ReportFeature;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}
