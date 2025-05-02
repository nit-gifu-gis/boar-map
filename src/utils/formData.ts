import { ImagewithLocation } from "@/components/ui/ImageInput/interface";
import { FeatureBase } from "@/types/features";
import { isObjectURLAvailable } from "@/utils/blobAvailable";
import { useEffect, useMemo, useState } from "react";
import { LayerType } from "./gis";

export interface InputFormData {
  dataType: LayerType;
  isLocationSkipped: boolean;
  isImageSkipped: boolean;
  inputData: {
    otherImageUrls?: ImagewithLocation[];
    teethImageUrls?: ImagewithLocation[];
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

export const useFormDataParser = () => {
  const [isObjectURLChecked, setIsObjectURLChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cookieData = useMemo(() => {
    if (typeof window === "undefined") return {};
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("formData="));
    if (!cookie) return {};
    const data = cookie.split("=")[1];
    return JSON.parse(data);
  }, []);

  const [currentData, setCurrentData] = useState<
    InputFormData | Record<string, never>
  >(cookieData);
  const isDataExsiting = useMemo(
    () => Object.keys(currentData).length === 0,
    [currentData],
  );

  useEffect(() => {
    if (isObjectURLChecked) return;

    const checkFunc = async () => {
      const dataCopy = JSON.parse(JSON.stringify(currentData)) as InputFormData;

      if (currentData.inputData === undefined) {
        setIsObjectURLChecked(true);
        setIsLoading(false);
        return;
      }

      const checkKeys: (keyof typeof currentData.inputData)[] = [
        "otherImageUrls",
        "teethImageUrls",
      ];

      for (const key of checkKeys) {
        if (!currentData.inputData[key]) {
          continue;
        }

        const urls = currentData.inputData[key] as ImagewithLocation[];

        const checkResults = await Promise.all(
          urls.map(async (url) => {
            return await isObjectURLAvailable(url.objectURL);
          }),
        );

        // 無効だったものを弾いてデータに反映させる。
        const filteredUrls = urls.filter((_, i) => checkResults[i]);
        dataCopy.inputData[key as "otherImageUrls" | "teethImageUrls"] =
          filteredUrls;
      }

      updateData(dataCopy);
      setIsObjectURLChecked(true);
      setIsLoading(false);
    };

    checkFunc();
  }, [isObjectURLChecked]);

  const updateData = (data: InputFormData | null) => {
    setCurrentData(data ?? {});
    document.cookie = `formData=${JSON.stringify(data)}; path=/`;
  };

  return {
    currentData,
    isLoading,
    isDataExsiting,
    updateData,
  } as const;
};
