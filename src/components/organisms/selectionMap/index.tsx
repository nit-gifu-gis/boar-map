import dynamic from 'next/dynamic';
import { SelectionMapProps } from './interface';

const SelectionMap = dynamic<SelectionMapProps>(() => import('./base'), {
  ssr: false,
});

export default SelectionMap;
