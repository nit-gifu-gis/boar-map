import React, { useImperativeHandle, useState } from 'react';
import { FeatureBase, YoutonFeature, YoutonProps } from '../../../types/features';
import { checkDateError, checkNumberError } from '../../../utils/validateData';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { YoutonInfoFormProps } from './interface';

const YoutonInfoForm = React.forwardRef<FeatureEditorHandler, YoutonInfoFormProps>(
  function InfoForm(props, ref) {
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const fetchData = () => {
      const form = document.getElementById('form-youton') as HTMLFormElement;
      // 施設名
      const name = form.farm_name.value as string;
      // 農場区分
      const kind = form.kind.value as string;
      // 別
      const type = form.type.options[form.type.selectedIndex].value as string;
      // 経営者
      const holder = form.holder.value as string;
      // 市町村
      const city = form.city.options[form.city.selectedIndex].value as string;
      // 地名
      const area = form.area.value as string;
      // 頭数
      const pig = form.pig_count.value as string;
      // 更新年月日
      const updated = form.update_date.value as string;

      const data: YoutonFeature = {
        properties: {
          施設名: name,
          県番号: '',
          農場区分: kind,
          肥育繁殖別: type,
          経営者: holder,
          市町村: city,
          地名: area,
          飼養頭数: pig,
          更新日: updated,
        },
        geometry: {
          type: 'Point',
          coordinates: [props.location.lng, props.location.lat],
        },
        type: 'Feature',
      };

      // 既存の更新の場合はID$を設定する
      if(props.featureInfo?.properties.ID$ != null) {
        data.properties.ID$ = props.featureInfo?.properties.ID$;
      }
      
      return new Promise<FeatureBase>((resolve) => resolve(data as FeatureBase));
    };

    const validateData = async () => {
      let valid = await validateText('farm_name');
      valid = valid && (await validateText('kind'));
      valid = valid && (await validateText('holder'));
      valid = valid && (await validateText('area'));
      valid = valid && (await validateNumber('pig_count'));
      valid = valid && (await validateDate('update_date'));
      return valid;
    };

    const validateNumber = async (id: string): Promise<boolean> => {
      const form = document.getElementById('form-youton') as HTMLFormElement;
      const numberStr = form[id].value as string;
      const error = checkNumberError(numberStr);
      if (error != null) {
        await updateError(id, error);
        return false;
      }
      const num = parseInt(numberStr);
      if (num < 0) {
        await updateError(id, '0未満の数値が入力されています。');
        return false;
      }
      await updateError(id, undefined);
      return true;
    };

    const validateDate = async (id: string): Promise<boolean> => {
      const form = document.getElementById('form-youton') as HTMLFormElement;
      const dateStr = form[id].value as string;
      const error = checkDateError(dateStr);
      if (error != null) {
        await updateError(id, error);
        return false;
      }
      await updateError(id, undefined);
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

    const featureValueOrUndefined = (key: keyof YoutonProps): string | undefined => {
      if (props.featureInfo == null) return undefined;

      if (props.featureInfo.properties[key as keyof YoutonProps] != null) {
        return props.featureInfo.properties[key];
      }
      return undefined;
    };

    const validateText = async (id: string) => {
      const form = document.getElementById('form-youton') as HTMLFormElement;
      const text = form[id].value as string;
      if (text.length === 0) {
        await updateError(id, '入力されていません。');
        return false;
      }
      await updateError(id, undefined);
      return true;
    };

    return (
      <div className='w-full'>
        <form id='form-youton' onSubmit={(e) => e.preventDefault()}>
          <InfoInput
            type='text'
            title='施設名'
            id='farm_name'
            required={true}
            defaultValue={featureValueOrUndefined('施設名')}
            onChange={() => validateText('farm_name')}
            error={errors.farm_name}
          />
          <InfoInput
            type='text'
            title='農場区分'
            id='kind'
            required={true}
            defaultValue={featureValueOrUndefined('農場区分')}
            onChange={() => validateText('kind')}
            error={errors.kind}
          />
          <InfoInput
            type='select'
            title='肥育・繁殖の別'
            options={['不明', '肥育', '繁殖']}
            id='type'
            defaultValue={featureValueOrUndefined('肥育繁殖別')}
          />
          <InfoInput
            type='text'
            title='経営者'
            id='holder'
            required={true}
            defaultValue={featureValueOrUndefined('経営者')}
            onChange={() => validateText('holder')}
            error={errors.holder}
          />
          <InfoInput
            type='city'
            title='市町村'
            id='city'
            lat={props.location.lat}
            lng={props.location.lng}
            defaultValue={featureValueOrUndefined('市町村')}
          />
          <InfoInput
            type='text'
            title='地名'
            id='area'
            required={true}
            defaultValue={featureValueOrUndefined('地名')}
            onChange={() => validateText('area')}
            error={errors.area}
          />
          <InfoInput
            type='number'
            min={0}
            step={1}
            title='飼養頭数'
            id='pig_count'
            required={true}
            defaultValue={featureValueOrUndefined('飼養頭数')}
            onChange={() => validateNumber('pig_count')}
            error={errors.pig_count}
          />
          <InfoInput
            type='date'
            title='更新年月日'
            id='update_date'
            required={true}
            defaultValue={featureValueOrUndefined('更新日')}
            onChange={() => validateDate('update_date')}
            error={errors.update_date}
          />
        </form>
      </div>
    );
  },
);

export default YoutonInfoForm;
