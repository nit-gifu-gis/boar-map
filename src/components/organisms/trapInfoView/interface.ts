import { TrapFeature } from '../../../types/features';

export interface TrapInfoViewProps {
  detail: TrapFeature;
  objectURLs?: string[];
  confirmMode?: boolean;
  imageIDs?: string[];
}
