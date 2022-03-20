import dynamic from 'next/dynamic';
import { MiniMapProps } from './interface';

const MiniMap = dynamic<MiniMapProps>(() => import('./base'), {
  ssr: false,
});

export default MiniMap;
