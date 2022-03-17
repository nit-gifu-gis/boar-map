import dynamic from 'next/dynamic';
import { MapBaseProps } from './interface';

const MapBase = dynamic<MapBaseProps>(() => import('./base'), {
  ssr: false,
});

export default MapBase;
