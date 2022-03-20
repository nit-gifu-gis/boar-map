import { BoarFeatureV1 } from '../../../types/features';

export interface BoarInfov1ViewProps {
  detail: BoarFeatureV1;
  objectURLs?: string[];
  confirmMode?: boolean;
  imageIDs?: string[];
}
