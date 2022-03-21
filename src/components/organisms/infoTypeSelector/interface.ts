import { LayerType } from '../../../utils/gis';

export interface InfoTypeSelectorProps {
  onChanged(type: LayerType): void;
  defaultValue: LayerType | null;
}
