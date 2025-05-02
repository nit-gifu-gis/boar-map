export interface MeshNoInputProps {
  id: string;
  defaultValue?: string;
  lat?: number;
  lng?: number;
  onChange?(): void;
  error: boolean;
}

export type MeshNoInputReqHeader = HeadersInit & {
  "X-Access-Token": string;
};
