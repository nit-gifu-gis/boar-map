export interface TextInputProps {
  type: string;
  name?: string;
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  max?: number;
  min?: number;
  step?: number;
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
  disabled?: boolean;
  required?: boolean;
  isError?: boolean;
  value?: string | number;
}
