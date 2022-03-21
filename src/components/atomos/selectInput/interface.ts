export interface SelectInputProps {
  options: string[];
  defaultValue?: string;
  id: string;
  onChange?(): void;
  error: boolean;
}
