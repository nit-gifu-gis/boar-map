import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ImagewithLocation } from '../components/atomos/imageInput/interface';
import { FeatureBase } from '../types/features';
import { LayerType } from './gis';
import { isObjectURLAvailable } from './image';

export interface InputFormData {
  dataType: LayerType;
  isLocationSkipped: boolean;
  isImageSkipped: boolean;
  inputData: {
    otherImageUrls?: ImagewithLocation[];
    teethImageUrls?: ImagewithLocation[];
    captureImageUrls?: ImagewithLocation[];
    captureWithLineImageUrls?: ImagewithLocation[];
    disposeImageUrls?: ImagewithLocation[];
    burialImageUrls?: ImagewithLocation[];
    newImageIds?: string[];
    gisData?: FeatureBase;
  };
  editData?: {
    id: string;
    type: string | null;
    type_srv: string | null;
    version: string | null;
    curImg: {
      teeth: string[];
      other: string[];
    };
  };
}

type FormDataState = InputFormData | Record<string, never>;

const readFormData = (): FormDataState => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem('formData') || '{}');
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as FormDataState)
      : {};
  } catch {
    return {};
  }
};

const persistFormData = (data: InputFormData | null) => {
  if (typeof window === 'undefined') return;
  try {
    // Photos stay as Blob URLs; only the form metadata is persisted.
    window.localStorage.setItem('formData', JSON.stringify(data));
  } catch (error) {
    // A storage restriction must not discard the data already held in memory.
    console.warn('入力内容をローカルストレージに保存できませんでした。', error);
  }
};

export const useFormDataParser = () => {
  // Read synchronously on client mount: existing form pages use this data in their first effect.
  const [currentData, setCurrentData] = useState<FormDataState>(readFormData);
  const initialData = useRef(currentData);
  const revision = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const isDataExsiting = useMemo(() => Object.keys(currentData).length === 0, [currentData]);

  const updateData = useCallback((data: InputFormData | null) => {
    revision.current += 1;
    persistFormData(data);
    setCurrentData(data ?? {});
  }, []);

  useEffect(() => {
    let active = true;
    const startRevision = revision.current;
    const checkFunc = async () => {
      const dataCopy = JSON.parse(JSON.stringify(initialData.current)) as InputFormData;

      if (!dataCopy.inputData) return;

      const checkKeys = [
        'otherImageUrls',
        'teethImageUrls',
        'captureImageUrls',
        'captureWithLineImageUrls',
        'disposeImageUrls',
        'burialImageUrls',
      ] as const;

      for (const key of checkKeys) {
        const urls = dataCopy.inputData[key];
        if (!Array.isArray(urls)) continue;

        const checkResults = await Promise.all(
          urls.map(async (url) => {
            return typeof url?.objectURL === 'string' && isObjectURLAvailable(url.objectURL);
          }),
        );

        // 無効だったものを弾いてデータに反映させる。
        const filteredUrls = urls.filter((_, i) => checkResults[i]);
        dataCopy.inputData[key] = filteredUrls;
      }

      // Do not overwrite a newer edit or publish the result after an unmount.
      if (active && revision.current === startRevision) updateData(dataCopy);
    };

    checkFunc().finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [updateData]);

  return {
    currentData,
    isLoading,
    isDataExsiting,
    updateData,
  } as const;
};
