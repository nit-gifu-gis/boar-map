import React, { useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { FeatureBase, VaccineFeature, VaccineProps } from '../../../types/features';
import { checkDateError, checkNumberError, compareDate } from '../../../utils/validateData';
import InfoDiv from '../../molecules/infoDiv';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { VaccineInfoFormProps } from './interface';

const InfoForm = React.forwardRef<FeatureEditorHandler, VaccineInfoFormProps>(function InfoForm(
  props,
  ref,
) {
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const { currentUser } = useCurrentUser();

  const fetchData = () => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user =
      props.featureInfo?.properties.入力者 != null
        ? props.featureInfo.properties.入力者
        : currentUser?.userId;
    // 1 位置情報
    const lat = props.location.lat;
    const lng = props.location.lng;
    // 2 メッシュ番号
    const meshNo = form.meshNo.value;
    // 3 散布年月日
    const treatDate = form.treatDate.value;
    // 4 散布数
    const treatNumber = form.treatNumber.value;
    // 隠し情報 回収済みかどうか
    const recover = recovered;
    // 5 回収年月日
    let recoverDate = '';
    // 6 摂食数
    let eatenNumber = '';
    // 7 その他の破損数
    let damageNumber = '';
    // 8 破損なし
    let noDamageNumber = '';
    // 8-1 ロスト数
    let lostNumber = '';
    // 9 備考
    const note = form.note.value;
    if (recover) {
      recoverDate = form.recoverDate.value;
      eatenNumber = form.eatenNumber.value;
      damageNumber = form.damageNumber.value;
      noDamageNumber = form.noDamageNumber.value;
      lostNumber = form.lostNumber.value;
    }

    const data: VaccineFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [props.location.lng, props.location.lat],
      },
      properties: {
        入力者: user,
        位置情報: '(' + lat + ',' + lng + ')',
        メッシュNO: meshNo as string,
        散布年月日: treatDate as string,
        散布数: treatNumber as string,
        回収年月日: recoverDate,
        摂食数: eatenNumber,
        その他の破損数: damageNumber,
        破損なし: noDamageNumber,
        ロスト数: lostNumber,
        備考: note as string,
        メッシュ番号: '',
        画像ID:
          props.featureInfo?.properties.画像ID != null ? props.featureInfo?.properties.画像ID : '',
      },
    };

    // 既存の更新の場合はID$を設定する
    if (props.featureInfo?.properties.ID$ != null) {
      data.properties.ID$ = props.featureInfo?.properties.ID$;
    }

    return new Promise<FeatureBase>((resolve) => resolve(data as FeatureBase));
  };

  const validateData = () => {
    let valid = validateDates();
    valid = valid && validateMeshNo();
    valid = valid && validateNumbers();

    Object.keys(errors).forEach((key) => {
      if (errors[key] != null) {
        console.warn(errors[key]);
        valid = false;
      }
    });
    return new Promise<boolean>((resolve) => resolve(valid));
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

  const featureValueOrUndefined = (key: keyof VaccineProps): string | undefined => {
    if (props.featureInfo == null) return undefined;

    if (props.featureInfo.properties[key as keyof VaccineProps] != null) {
      return props.featureInfo.properties[key];
    }
    return undefined;
  };

  const validateDates = () => {
    // 散布年月日をチェック
    if (!validateDate('treatDate')) {
      return false;
    }
    // 未回収なら，それ以外のエラーを消して終了
    if (!recovered) {
      updateError('recoverDate', undefined);
      return true;
    }
    // 回収済みなら，回収年月日をチェック
    if (!validateDate('recoverDate')) {
      return false;
    }
    // ここまできたら，それぞれの日付はOK，前後関係を確認する
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const treatDateStr = form.treatDate.value;
    const recoverDateStr = form.recoverDate.value;
    // 散布年月日 > 回収年月日ならエラー
    if (compareDate(treatDateStr, recoverDateStr) > 0) {
      updateError('recoverDate', '散布年月日よりも前の日付が入力されています。');
      return false;
    }
    updateError('treatDate', undefined);
    updateError('removeDate', undefined);
    return true;
  };

  const validateNumbers = () => {
    // 散布数をチェック
    if (!validateTreatNum()) {
      return false;
    }
    // 未回収なら，それ以外のエラーを消して終了
    if (!recovered) {
      updateError('treatNumber', undefined);
      updateError('eatenNumber', undefined);
      updateError('damageNumber', undefined);
      updateError('noDamageNumber', undefined);
      updateError('lostNumber', undefined);
      return true;
    }
    // 回収済みなら，各種エラーをチェック
    let pass = validateNumber('eatenNumber');
    pass = pass && validateNumber('damageNumber');
    pass = pass && validateNumber('noDamageNumber');
    pass = pass && validateNumber('lostNumber');
    if (!pass) {
      return false;
    }
    // ここまできたら，各種数値はOK
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const treatNumber = parseInt(form.treatNumber.value);
    const eatenNumber = parseInt(form.eatenNumber.value);
    const damageNumber = parseInt(form.damageNumber.value);
    const noDamageNumber = parseInt(form.noDamageNumber.value);
    const lostNumber = parseInt(form.lostNumber.value);
    const totalNumber = eatenNumber + damageNumber + noDamageNumber + lostNumber;
    if (treatNumber != totalNumber) {
      updateError('treatNumber', '散布数と回収に係る数の合計が合っていません。');
      updateError('eatenNumber', '散布数と回収に係る数の合計が合っていません。');
      updateError('damageNumber', '散布数と回収に係る数の合計が合っていません。');
      updateError('noDamageNumber', '散布数と回収に係る数の合計が合っていません。');
      updateError('lostNumber', '散布数と回収に係る数の合計が合っていません。');
      return false;
    }
    return true;
  };

  const validateMeshNo = (): boolean => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const meshNo = form.meshNo.value as string;
    if (meshNo === '') {
      updateError('meshNo', '入力されていません。');
      return false;
    } else {
      updateError('meshNo', undefined);
      return true;
    }
  };

  const validateTreatNum = (): boolean => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const numberStr = form['treatNumber'].value;
    const error = checkNumberError(numberStr);
    if (error != null) {
      updateError('treatNumber', error);
      return false;
    }
    const num = parseInt(numberStr);
    if (num <= 0) {
      updateError('treatNumber', '0以下の数値が入力されています。');
      return false;
    }
    updateError('treatNumber', undefined);
    return true;
  };

  const validateDate = (id: string): boolean => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const dateStr = form[id].value as string;
    const error = checkDateError(dateStr);
    if (error != null) {
      updateError(id, error);
      return false;
    }
    updateError(id, undefined);
    return true;
  };

  const validateNumber = (id: string): boolean => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
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

  const [recovered, setRecovered] = useState<boolean>(!!featureValueOrUndefined('回収年月日'));
  const onChangeRecover = () => {
    const form = document.getElementById('form-vaccine') as HTMLFormElement;
    const recover = form.recover.options[form.recover.selectedIndex].value as string;
    setRecovered(recover == '回収済み');
  };

  return (
    <div className='w-full'>
      <form name='form-vaccine' id='form-vaccine' onSubmit={(e) => e.preventDefault()}>
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
          title='メッシュ番号'
          type='mesh-num'
          id='meshNo'
          defaultValue={featureValueOrUndefined('メッシュ番号')}
          lat={props.location.lat}
          lng={props.location.lng}
          required={true}
          onChange={validateMeshNo}
          error={errors.meshNo}
        />
        <InfoInput
          title='散布年月日'
          type='date'
          id='treatDate'
          defaultValue={featureValueOrUndefined('散布年月日')}
          required={true}
          onChange={() => validateDate('treatDate')}
          error={errors.treatDate}
        />
        <InfoInput
          title='散布数'
          type='number'
          id='treatNumber'
          min={1}
          defaultValue={featureValueOrUndefined('散布数')}
          onChange={validateTreatNum}
          required={true}
          error={errors.treatNumber}
        />
        <InfoInput
          title='回収状況'
          type='select'
          id='recover'
          onChange={onChangeRecover}
          options={['未回収', '回収済み']}
          defaultValue={!featureValueOrUndefined('回収年月日') ? '未回収' : '回収済み'}
        />
        {!recovered ? (
          <></>
        ) : (
          <>
            <InfoInput
              title='回収年月日'
              type='date'
              id='recoverDate'
              defaultValue={featureValueOrUndefined('回収年月日')}
              required={true}
              onChange={() => validateDate('recoverDate')}
              error={errors.recoverDate}
            />
            <InfoInput
              title='いのししの摂食数'
              type='number'
              id='eatenNumber'
              min={0}
              step={1}
              defaultValue={featureValueOrUndefined('摂食数')}
              required={true}
              onChange={() => validateNumber('eatenNumber')}
              error={errors.eatenNumber}
            />
            <InfoInput
              title='その他の破損数'
              type='number'
              id='damageNumber'
              min={0}
              step={1}
              defaultValue={featureValueOrUndefined('その他の破損数')}
              required={true}
              onChange={() => validateNumber('damageNumber')}
              error={errors.damageNumber}
            />
            <InfoInput
              title='破損なし'
              type='number'
              id='noDamageNumber'
              min={0}
              step={1}
              defaultValue={featureValueOrUndefined('破損なし')}
              required={true}
              onChange={() => validateNumber('noDamageNumber')}
              error={errors.noDamageNumber}
            />
            <InfoInput
              title='ロスト数'
              type='number'
              id='lostNumber'
              min={0}
              step={1}
              defaultValue={featureValueOrUndefined('ロスト数')}
              required={true}
              onChange={() => validateNumber('lostNumber')}
              error={errors.lostNumber}
            />
          </>
        )}
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

export default InfoForm;
