import { VaccineFeature } from '../../../types/features';

export interface VaccineInfoViewProps {
  detail: VaccineFeature;
  objectURLs?: string[];
  confirmMode?: boolean;
  imageIDs?: string[];
}
