import { BoarInfoFeatureV2, FeatureBase } from '../../../types/features';
import { BoarFormRef } from '../../organisms/boarInfov2Form/interface';
import { Location } from '../../organisms/mapBase/interface';

export interface BoarDetailFormProps {
  detail?: BoarInfoFeatureV2;
  myTraderInfo?: MyTraderInfo | null;
  formKey: string;
  is_first: boolean;
  is_dead?: boolean;
  location: Location;
  formRefs: BoarFormRef[];
  onFirstDisposeChanged?(type: string): void;
}

export interface TraderList {
  area: string[];
  trader: Record<string, TraderInfo[]>;
}

export interface MyTraderInfo {
  area?: string;
  info?: TraderInfo;
}

export interface TraderInfo {
  area?: string;
  name: string;
  code: string;
}

export interface BoarDetailFormHandler {
  validateData(): boolean;
  fetchData(): FeatureBase | null;
  setDead(): void;
  is_first: boolean;
  setType(type: string): void;
}
