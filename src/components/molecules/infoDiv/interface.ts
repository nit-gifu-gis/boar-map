export interface InfoDivProps {
  type?: 'text' | 'date' | 'number' | 'location' | 'images' | 'gray' | 'period';
  data?: string | Record<string, unknown>;
  unit?: string;
  title: string;
}
