import { ReportFeature } from '../../../types/features';
import { LatLngZoom } from '../mapBase/interface';

export interface ReportInfoFormProps {
  location: LatLngZoom;
  featureInfo?: ReportFeature;
  isEditMode?: boolean;
}
