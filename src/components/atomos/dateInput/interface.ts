export interface DateInputProps {
  id: string;
  onChange?(): void;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: boolean;
  date?: string;
  required?: boolean;
}
