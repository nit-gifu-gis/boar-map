// 定数

// 中間サーバー選択用
const getServerURI = (): string => {
  if (process.browser) {
    // ブラウザで処理が行われている時はアクセスされているドメインを見る
    const domain = document.domain.toLowerCase();
    if (
      domain.endsWith(".tajimalab.prsvr.net") ||
      domain.endsWith(".junki-t.net") ||
      domain.endsWith(".vercel.app") ||
      domain.endsWith(".now.sh")
    ) {
      // 開発用サーバー (develop)
      return "https://dev1.tajimalab.prsvr.net/api";
    } else if (domain.endsWith("localhost")) {
      // 開発用ローカル
      return "https://localhost";
    }
  }
  return "https://boar-map.gifugis.jp/api"; // デフォルト
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
