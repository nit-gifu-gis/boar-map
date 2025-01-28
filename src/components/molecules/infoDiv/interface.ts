export interface InfoDivProps {
  type?: 'text' | 'date' | 'number' | 'location' | 'images' | 'gray' | 'period' | 'work' | 'workB';
  data?: string | Record<string, unknown> | unknown[];
  unit?: string;
  title: string;
}
