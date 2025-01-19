export interface TextAreaInputProps {
  id: string;
  cols?: number;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  onChange?(): void;
  required?: boolean;
  error?: boolean;
  value?: string;
}
