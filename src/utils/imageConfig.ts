
import { InputFormData } from '@/utils/form-data';

type ImageConfig = {
  label: string;
  propertyKey: string;
  frontPropertyKey: string;
  urlKey: keyof InputFormData["inputData"];
  frontUrlKey: keyof InputFormData["inputData"];
  max: number;
  condition: boolean;
};

type ImageConfigsType = {
  [key: string]: ImageConfig;
};

export const createImageConfigs = (ctx: {
  type?: string;
  type_srv?: string | null;
  isEditing: boolean;
}): ImageConfigsType => {
  const isBoar = Boolean (!ctx.isEditing && ctx.type === 'boar');
  const isEditBoar = Boolean (ctx.isEditing && ctx.type_srv === 'boar-2');

  return {
    teeth: {
      label: '歯列写真(遠沈管の番号と下アゴの奥歯の本数がわかるように撮影)',
      propertyKey: '歯列写真ID',
      frontPropertyKey: '歯列写真ID',
      urlKey: 'teethImageUrls',
      frontUrlKey: 'teethImageUrls',
      max: 2,
      condition: isBoar || isEditBoar,
    },
    captureRecord: {
      label: '捕獲個体（右向、日付入り）と捕獲者（又は看板）',
      propertyKey: '写真ID',
      frontPropertyKey: '捕獲写真ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'captureImageUrls',
      max: 2,
      condition: isBoar,
    },
    captureRecordWithLine: {
      label: '捕獲個体（右向、日付入り）と捕獲者（又は看板）、捕獲個体の日付の上に線を引いたもの',
      propertyKey: '写真ID',
      frontPropertyKey: '線入り捕獲写真ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'captureWithLineImageUrls',
      max: 2,
      condition: isBoar,
    },
    disposal: {
      label: '処分方法がわかる写真等',
      propertyKey: '写真ID',
      frontPropertyKey: '処分写真ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'disposeImageUrls',
      max: 2,
      condition: isBoar,
    },
    burial: {
      label: '埋却処分の完了写真（埋却処分の場合のみ）',
      propertyKey: '写真ID',
      frontPropertyKey: '埋葬写真ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'burialImageUrls',
      max: 2,
      condition: isBoar,
    },
    other: {
      label: '画像',
      propertyKey: '画像ID',
      frontPropertyKey: '画像ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'otherImageUrls',
      max: 10,
      condition: !isBoar && !isEditBoar,
    },
    boarOther: {
      label: 'その他の画像',
      propertyKey: '写真ID',
      frontPropertyKey: '画像ID',
      urlKey: 'otherImageUrls',
      frontUrlKey: 'otherImageUrls',
      max: 10,
      condition: isEditBoar
    }
  };
};