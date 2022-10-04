import React, { useImperativeHandle, useState } from 'react';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { TrapInfoFormProps } from './interface';
import { PointGeometry, TrapFeature, TrapProps } from '../../../types/features';
import InfoDiv from '../../molecules/infoDiv';
import { checkDateError, compareDate } from '../../../utils/validateData';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';

const TrapInfoForm = React.forwardRef<FeatureEditorHandler, TrapInfoFormProps>(function InfoForm(
  props,
  ref,
) {
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const { currentUser } = useCurrentUser();

  const getCityName = async () => {
    const body = {
      geometry: {
        type: 'Point',
        coordinates: [[props.location.lng, props.location.lat]],
      },
    };

    const res = await fetch(SERVER_URI + '/Features/GetCity', {
      method: 'POST',
      headers: {
        'X-Access-Token': getAccessToken(),
      },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      const json = await res.json();
      const features = json['features'];
      if (features != null && features.length !== 0) {
        return features[0]['properties']['NAME'];
      } else {
        return '';
      }
    } else {
      return '';
    }
  };

  const fetchData = async () => {
    if (currentUser == null) return new Promise<null>((resolve) => resolve(null));

    const form = document.getElementById('form-trap') as HTMLFormElement;

    // 入力者
    const user =
      props.featureInfo?.properties.入力者 != null
        ? props.featureInfo.properties.入力者
        : currentUser?.userId;
    // 設置年月日
    const place_date = form['place_date'].value as string;
    // 撤去年月日
    const remove_date = form['remove_date'].value as string;
    // わなの種類
    const trap_kind = form['kind'].options[form['kind'].selectedIndex].value as string;
    // 備考
    const note = form['note'].value as string;
    // 市町村
    const city = await getCityName();
    // 位置情報
    const geo: PointGeometry = {
      type: 'Point',
      coordinates: [props.location.lng, props.location.lat],
    };

    // データ (画像IDはあとから代入するから空白)
    const data: TrapFeature = {
      type: 'Feature',
      geometry: geo,
      properties: {
        入力者: user,
        設置年月日: place_date,
        撤去年月日: remove_date,
        罠の種類: trap_kind,
        市町村: city,
        備考: note,
        位置情報: `(${props.location.lat},${props.location.lng})`,
        画像ID:
          props.featureInfo?.properties.画像ID != null ? props.featureInfo?.properties.画像ID : '',
      },
    };

    // 既存の更新の場合はID$を設定する
    if (props.featureInfo?.properties.ID$ != null) {
      data.properties.ID$ = props.featureInfo?.properties.ID$;
    }

    return data;
  };

  const validateData = () => {
    let valid = validateDates();
    Object.keys(errors).forEach((key) => {
      if (errors[key] != null) {
        console.error(errors[key]);
        valid = false;
      }
    });
    return new Promise<boolean>((resolve) => resolve(valid));
  };

  const validateDate = (id: string, required: boolean) => {
    const form = document.getElementById('form-trap') as HTMLFormElement;
    const dateStr = form[id].value;
    const error = checkDateError(dateStr);
    if (error != null && !(!required && error == '日付が入力されていません。')) {
      updateError(id, error);
      return false;
    }
    updateError(id, undefined);
    return true;
  };

  const validateDates = () => {
    // 設置年月日
    if (!validateDate('place_date', true)) {
      return false;
    }

    // 撤去年月日
    if (!validateDate('remove_date', false)) {
      return false;
    }

    // 設置・撤去の前後関係チェック
    const form = document.getElementById('form-trap') as HTMLFormElement;
    const dateStr1 = form['place_date'].value;
    const dateStr2 = form['remove_date'].value;

    // 設置年月日 > 撤去年月日ならエラー
    if (compareDate(dateStr1, dateStr2) > 0) {
      updateError('place_date', '撤去年月日よりも後の日付が入力されています。');

      updateError('remove_date', '設置年月日よりも前の日付が入力されています。');
      return false;
    }

    updateError('place_date', undefined);
    updateError('remove_date', undefined);
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

  const featureValueOrUndefined = (key: keyof TrapProps): string | undefined => {
    if (props.featureInfo == null) return undefined;

    if (props.featureInfo.properties[key as keyof TrapProps] != null) {
      return props.featureInfo.properties[key];
    }
    return undefined;
  };

  return (
    <div className='w-full'>
      <form name='form-trap' id='form-trap' onSubmit={(e) => e.preventDefault()}>
        <InfoDiv
          title='画像'
          type='images'
          data={{
            objectURLs: props.objectURLs == null ? [] : props.objectURLs.map((p) => p.objectURL),
            imageIDs: props.imageIds == null ? [] : props.imageIds,
            confirmMode: true,
          }}
        />
        <InfoInput
          title='設置年月日'
          type='date'
          id='place_date'
          defaultValue={featureValueOrUndefined('設置年月日')}
          required={true}
          onChange={() => validateDate('place_date', true)}
          error={errors.place_date}
        />
        <InfoInput
          title='わなの種類'
          type='select'
          id='kind'
          options={['くくりわな', '箱わな', '囲いわな', '銃猟', 'その他']}
          defaultValue={featureValueOrUndefined('罠の種類')}
        />
        <InfoInput
          title='撤去年月日'
          type='date'
          id='remove_date'
          defaultValue={featureValueOrUndefined('撤去年月日')}
          onChange={() => validateDate('remove_date', false)}
          error={errors.remove_date}
        />
        <InfoInput
          title='備考'
          type='textarea'
          rows={4}
          id='note'
          defaultValue={featureValueOrUndefined('備考')}
        />
      </form>
    </div>
  );
});

export default TrapInfoForm;
