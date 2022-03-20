import { ReportFeature } from '../../../types/features';

export interface ReportInfoViewProps {
  detail: ReportFeature;
  objectURLs?: string[];
  confirmMode?: boolean;
  imageIDs?: string[];
}
