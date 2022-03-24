import { HeaderColor } from '../components/organisms/header/interface';

export const to_header_color = (val: string): HeaderColor => {
  switch (val) {
    case 'いのしし捕獲地点':
    case 'boar-1':
    case 'boar-2':
    case 'boar-old':
    case 'boar':
      return 'boar';
    case 'trap':
      return 'trap';
    case 'vaccine':
      return 'vaccine';
    case 'report':
      return 'report';
    case 'butanetsu':
      return 'butanetsu';
    case 'youton':
      return 'youton';
    default:
      return 'primary';
  }
};

export const to_header_title = (val: string | null): string => {
  switch (val) {
    case 'boar-1':
    case 'boar-2':
    case 'boar-old':
    case 'boar':
      return '捕獲情報';
    case 'trap':
      return 'わな情報';
    case 'vaccine':
      return 'ワクチン情報';
    case 'report':
      return '作業日報';
    case 'butanetsu':
      return '豚熱感染情報';
    case 'youton':
      return '養豚場情報';
    default:
      return '情報確認';
  }
};
