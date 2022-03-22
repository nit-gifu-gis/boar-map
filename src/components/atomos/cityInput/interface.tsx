export interface CityInput {
  id: string;
  defaultValue?: string;
  onChange?(): void;
  error: boolean;
  lat?: number;
  lng?: number;
}
