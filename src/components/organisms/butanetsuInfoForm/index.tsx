import React, { useImperativeHandle, useState } from 'react';
import { ButanetsuFeature, ButanetsuProps, FeatureBase } from '../../../types/features';
import { checkDateError, checkNumberError } from '../../../utils/validateData';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { ButanetsuInfoFormProps } from './interface';

const ButanetsuInfoForm = React.forwardRef<FeatureEditorHandler, ButanetsuInfoFormProps>(
  function InfoForm(props, ref) {
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const fetchData = () => {
      const form = document.getElementById('form-butanetsu') as HTMLFormElement;
      // 1 位置情報
      const lat = props.location.lat;
      const lng = props.location.lng;
      // 2 捕獲日
      const catchDate = form.catchDate.value as string;
      // 3 県番号
      const prefNo = form.prefNo.value as string;

      const data: ButanetsuFeature = {
        properties: {
          捕獲年月日: catchDate,
          県番号: prefNo,
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        type: 'Feature',
      };

      // 既存の更新の場合はID$を設定する
      if (props.featureInfo?.properties.ID$ != null) {
        data.properties.ID$ = props.featureInfo?.properties.ID$;
      }

      return new Promise<FeatureBase>((resolve) => resolve(data));
    };

    const validateData = () => {
      let valid = true;
      valid = valid && validateDate('catchDate', true);
      valid = valid && validateNumber('prefNo');
      return new Promise<boolean>((resolve) => resolve(valid));
    };

    const validateDate = (id: string, required: boolean) => {
      const form = document.getElementById('form-butanetsu') as HTMLFormElement;
      const dateStr = form[id].value;
      const error = checkDateError(dateStr);
      if (error != null && !(!required && error == '日付が入力されていません。')) {
        updateError(id, error);
        return false;
      }
      updateError(id, undefined);
      return true;
    };

    const validateNumber = (id: string): boolean => {
      const form = document.getElementById('form-butanetsu') as HTMLFormElement;
      const numberStr = form[id].value as string;
      const error = checkNumberError(numberStr);
      if (error != null) {
        updateError(id, error);
        return false;
      }
      const num = parseInt(numberStr);
      if (num < 0) {
        updateError(id, '0未満の数値が入力されています。');
        return false;
      }
      updateError(id, undefined);
      return true;
    };

    const updateError = (id: string, value: string | undefined) => {
      setErrors((err) => {
        const e = { ...err };
        e[id] = value;
        return e;
      });
    };

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    const featureValueOrUndefined = (key: keyof ButanetsuProps): string | undefined => {
      if (props.featureInfo == null) return undefined;

      if (props.featureInfo.properties[key as keyof ButanetsuProps] != null) {
        return props.featureInfo.properties[key];
      }
      return undefined;
    };

    return (
      <div className='w-full'>
        <form id='form-butanetsu' onSubmit={(e) => e.preventDefault()}>
          <InfoInput
            title='捕獲日'
            type='date'
            defaultValue={featureValueOrUndefined('捕獲年月日')}
            id='catchDate'
            onChange={() => validateDate('catchDate', true)}
            required={true}
            error={errors.catchDate}
          />
          <InfoInput
            title='県番号'
            type='number'
            defaultValue={featureValueOrUndefined('県番号')}
            id='prefNo'
            required={true}
            onChange={() => validateNumber('prefNo')}
            error={errors.prefNo}
          />
        </form>
      </div>
    );
  },
);

export default ButanetsuInfoForm;
