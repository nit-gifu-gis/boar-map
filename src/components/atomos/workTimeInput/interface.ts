export interface WorkTimeInputProps {
  id: string;
  defaultStart?: string;
  defaultEnd?: string;
  required?: boolean;
  onChange?(): void;
  error?: string;
}
