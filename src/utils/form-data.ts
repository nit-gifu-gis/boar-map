import { useEffect, useMemo, useState } from "react";
import { LayerType } from "./gis";
import { parseCookies, setCookie } from "nookies";
import { isObjectURLAvailable } from "./image";
import { FeatureBase } from "../types/features";
import { ImagewithLocation } from "../components/atomos/imageInput/interface";

export interface InputFormData {
  dataType: LayerType;
  isLocationSkipped: boolean;
  isImageSkipped: boolean;
  inputData: {
    otherImageUrls?: ImagewithLocation[];
    teethImageUrls?: ImagewithLocation[];
    newImageIds?: string[];
    gisData?: FeatureBase;
  }
  editData?: {
    id: string;
    type: string | null;
    type_srv: string | null;
    version: string | null;
    curImg: {
      teeth: string[];
      other: string[];
    }
  }
}

export const useFormDataParser = () => {
  const [isObjectURLChecked, setIsObjectURLChecked] = useState(false);
  const [currentData, setCurrentData] = useState<InputFormData | Record<string, never>>(JSON.parse(parseCookies()['formData'] || '{}') ?? {});
  const [isLoading, setIsLoading] = useState(true);
  const isDataExsiting = useMemo(() => Object.keys(currentData).length === 0, [currentData]);

  useEffect(() => {
    console.log('updated', currentData);
  }, [currentData]);

  useEffect(() => {
    if (isObjectURLChecked)
      return;

    const checkFunc = async () => {
      const dataCopy = JSON.parse(JSON.stringify(currentData)) as InputFormData;

      if (currentData.inputData === undefined) {
        setIsObjectURLChecked(true);
        setIsLoading(false);
        return;
      }

      const checkKeys: (keyof typeof currentData.inputData)[] = [
        'otherImageUrls',
        'teethImageUrls'
      ];

      for (const key of checkKeys) {
        if (!currentData.inputData[key]) {
          continue;
        }

        const urls = currentData.inputData[key] as ImagewithLocation[];

        const checkResults = await Promise.all(urls.map(async (url) => {
          return await isObjectURLAvailable(url.objectURL);
        }));

        // 無効だったものを弾いてデータに反映させる。
        const filteredUrls = urls.filter((_, i) => checkResults[i]);
        dataCopy.inputData[key as 'otherImageUrls' | 'teethImageUrls'] = filteredUrls;  
      }

      updateData(dataCopy);
      setIsObjectURLChecked(true);
      setIsLoading(false);
    };

    checkFunc();
  }, [isObjectURLChecked]);

  const updateData = (data: InputFormData | null) => {
    setCurrentData(data ?? {});
    setCookie(null, "formData", JSON.stringify(data), { path: '/' });
  };

  return {
    currentData,
    isLoading,
    isDataExsiting,
    updateData
  } as const;
};