export interface InfoInputProps {
  type: string;
  id: string;
  title: string;
  max?: number;
  min?: number;
  defaultValue?: string;
  step?: number;
  onChange?(): void;
  placeholder?: string;
  error?: string;
  options?: string[];
  cols?: number;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  lat?: number;
  lng?: number;
  caption?: string;
}
