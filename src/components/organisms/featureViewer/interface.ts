import { FeatureBase } from '../../../types/features';

export interface FeatureViewerProps {
  featureInfo: FeatureBase | null;
  type: string | null;
  confirm?: boolean;
  objectURLs?: string[];
  imageIDs?: string[];
}
