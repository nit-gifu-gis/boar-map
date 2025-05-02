export interface CityInputProps {
  id: string;
  defaultValue?: string;
  onChange?(): void;
  error: boolean;
  lat?: number;
  lng?: number;
}

export type CityInputReqHeader = HeadersInit & {
  "X-Access-Token": string;
};
