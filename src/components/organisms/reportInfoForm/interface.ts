import { ReportFeature } from '@/types/features';

import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface ReportInfoFormProps {
  location: LatLngZoom;
  featureInfo?: ReportFeature;
  isEditMode?: boolean;
}
