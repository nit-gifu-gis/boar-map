import { BoarFeatureV2 } from '@/types/features';

import { BoarDetailFormHandler } from '@/components/atomos/boarDetailForm/interface';
import { ImagewithLocation } from '@/components/atomos/imageInput/interface';
import { LatLngZoom } from '@/components/organisms/mapBase/interface';

export interface BoarInfov2FormProps {
  location: LatLngZoom;
  featureInfo?: BoarFeatureV2;
  imageIds?: string[];
  objectURLs?: ImagewithLocation[];
  isEditMode?: boolean;
}

export interface BoarFormRef {
  ref: React.RefObject<BoarDetailFormHandler>;
  obj: JSX.Element;
}
