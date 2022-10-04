// 定数

// 中間サーバー選択用
const getServerURI = (): string => {
  if (process.browser) {
    // ブラウザで処理が行われている時はアクセスされているドメインを見る
    const domain = document.domain.toLowerCase();
    if (domain.endsWith('.gifu-nct.ac.jp')) {
      // 開発用サーバー (develop)
      return 'https://boarmap-dev.gifu-nct.ac.jp/api';
    } else if (domain.endsWith('localhost')) {
      // 開発用ローカル
      return 'https://localhost';
    }
  }
  return 'https://boar-map.gifugis.jp/api'; // デフォルト
};

export const SERVER_URI = getServerURI();

export const MAX_UPLOAD_SIZE = 20 * (1024 * 1024);

export const getColorCode = (colorText: string) => {
  let colorCode = '#ff9800';
  switch (colorText) {
    case 'primary':
      colorCode = '#ff9800';
      break;
    case 'accent':
      colorCode = '#536dfe';
      break;
    case 'danger':
      colorCode = '#ff0000';
      break;
    case 'boar':
      colorCode = '#842929';
      break;
    case 'trap':
      colorCode = '#fbc02d';
      break;
    case 'vaccine':
      colorCode = '#0288d1';
      break;
    default:
      break;
  }
  return colorCode;
};

export const layerLabels: { name: string; icon: string }[] = [
  {
    name: 'いのしし捕獲地点',
    icon: '/static/images/icons/boar.svg',
  },
  {
    name: 'わな設置地点',
    icon: '/static/images/icons/trap.svg',
  },
  {
    name: 'ワクチン散布地点',
    icon: '/static/images/icons/vaccine.svg',
  },
  {
    name: '養豚場',
    icon: '/static/images/icons/youton.png',
  },
  {
    name: '豚熱陽性高率エリア',
    icon: '/static/images/icons/butanetsu.png',
  },
  {
    name: '作業日報',
    icon: '/static/images/icons/report.png',
  },
];
