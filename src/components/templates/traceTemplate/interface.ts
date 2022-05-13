export interface QueryError {
  status: number;
  reason: string;
}

export interface QueryResult {
  area: string;
  check_no: number;
  city: string;
  date: string;
  division: string;
  gender: string;
  id: string;
  is_child: boolean;
  length: number;
  pcr_date: string;
  pcr_result: string;
  weight: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isError = (arg: any): arg is QueryError => {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    typeof arg.reason === 'string' &&
    typeof arg.status === 'number'
  );
};
