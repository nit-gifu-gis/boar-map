export interface MeshNoInputProps {
  id: string;
  defaultValue?: string;
  lat?: number;
  lng?: number;
  onChange?(): void;
  error: boolean;
}
