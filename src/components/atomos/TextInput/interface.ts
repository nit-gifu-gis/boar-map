export interface TextInputProps {
  type: string;
  name?: string;
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  max?: number;
  min?: number;
  step?: number;
  onChange?(): React.ChangeEvent<HTMLInputElement>;
  disabled?: boolean;
  required?: boolean;
  isError?: boolean;
}
