export interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  error: boolean;
  is_number?: boolean;
}
