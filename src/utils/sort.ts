import {
  BoarFeatureV2,
  FeatureBase,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
} from '../types/features';

export const sortFeatures = (
  key: string,
  features: BoarFeatureV2[] | TrapFeature[] | ReportFeature[] | VaccineFeature[],
  desc: boolean,
): BoarFeatureV2[] | TrapFeature[] | ReportFeature[] | VaccineFeature[] => {
  return features.sort((a, b) => {
    const getItem = (feature: FeatureBase, key: string): string | Date | number => {
      const props = feature.properties as Record<string, string>;

      // 日付データ
      if (
        key === '散布年月日' ||
        key === '回収年月日' ||
        key === '撤去年月日' ||
        key === '設置年月日' ||
        key === '作業開始時' ||
        key === '作業終了時' ||
        key === '捕獲年月日'
      ) {
        // 空の時は0
        if (props[key] === '') return '';

        return new Date(props[key]);
      }

      // 数字データ
      if (
        key === 'ID$' ||
        key === '捕獲頭数' ||
        key === '摂食数' ||
        key === 'その他の破損数' ||
        key === '破損なし' ||
        key === 'ロスト数'
      ) {
        // 空文字の場合は一番下になるように
        if (props[key] === '') return desc ? Number.MIN_VALUE : Number.MAX_VALUE;
        return parseFloat(props[key]);
      }

      // 特殊データ1
      if (key === '成獣の頭数') {
        const d = feature as BoarFeatureV2;
        const boars = d.properties.捕獲いのしし情報;
        let count = 0;
        boars.forEach((v) => {
          if (v.properties.成獣幼獣別 == '成獣') count++;
        });

        return count;
      }

      // 特殊データ2
      if (key === '幼獣の頭数') {
        const d = feature as BoarFeatureV2;
        const boars = d.properties.捕獲いのしし情報;
        let count = 0;
        boars.forEach((v) => {
          if (v.properties.成獣幼獣別 == '幼獣') count++;
        });

        return count;
      }

      // 特殊データ3
      if (key === '回収状況') {
        return props['回収年月日'] === '' ? '未回収' : '回収済';
      }

      // その他
      return props[key];
    };

    const aItem = getItem(a, key);
    const bItem = getItem(b, key);

    // 空文字＝未入力データ＝下に寄せる
    if ((aItem === '' && bItem !== '') || (aItem === new Date(0) && bItem !== new Date(0))) {
      return 1;
    }
    if ((bItem === '' && aItem !== '') || (bItem === new Date(0) && aItem !== new Date(0))) {
      return -1;
    }

    const rev = desc ? -1 : 1;
    if (aItem > bItem) {
      return 1 * rev;
    } else if (aItem < bItem) {
      return -1 * rev;
    } else {
      // データが同じ時はIDで比較
      const aId = parseInt(a.properties['ID$'] as string);
      const bId = parseInt(b.properties['ID$'] as string);
      if (aId > bId) {
        return 1 * rev;
      } else if (aId < bId) {
        return -1 * rev;
      } else {
        // 本来ここには来ない
        return 0;
      }
    }
  });
};
