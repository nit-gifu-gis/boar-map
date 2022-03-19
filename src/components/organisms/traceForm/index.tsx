import React, { useState } from 'react';
import { checkLuhn } from '../../../utils/jibie';
import RoundButton from '../../atomos/roundButton';
import TextInput from '../../atomos/TextInput';
import { TraceFormProps } from './interface';

const TraceForm: React.FunctionComponent<TraceFormProps> = ({ onSubmit }) => {
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('検索');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [boarNo, setBoarNo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setInputDisabled(true);
    setButtonEnabled(false);
    setButtonLabel('検索中...');
    await onSubmit(boarNo);
    setInputDisabled(false);
    setButtonEnabled(true);
    setButtonLabel('検索');
  };

  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const NUMBER_LENGTH = 9;

    const boarNo = e.target.value;
    if (boarNo === '') {
      // 何も入力されていない場合はエラーを消して終了する。
      setError('');
      setBoarNo('');
      setButtonEnabled(false);
      return;
    }

    if (Number.isNaN(Number(boarNo))) {
      // 数字以外が入力された場合にはエラーを出す。
      setError('数字以外が入力されています。');
      setBoarNo('');
      setButtonEnabled(false);
      return;
    }

    if (boarNo.length < NUMBER_LENGTH) {
      // 指定された桁数未満の場合は何もしない
      setError('');
      setBoarNo('');
      setButtonEnabled(false);
      return;
    }

    if (boarNo.length > NUMBER_LENGTH) {
      // 指定された桁数より長い場合はエラーを出す。
      setError('データの形式が不正です。');
      setBoarNo('');
      setButtonEnabled(false);
      return;
    }

    if (!checkLuhn(boarNo)) {
      // チェックディジットを計算して間違っている場合にはエラーを返す。
      setError('入力された値が間違っています。');
      setBoarNo('');
      setButtonEnabled(false);
      return;
    }

    setButtonEnabled(true);
    setBoarNo(e.target.value);
    setError('');
  };

  return (
    <>
      <div className='text-2xl font-bold'>検索条件</div>
      <div className='mb-8 box-border w-full rounded-xl border-2 border-solid border-border py-3 px-4'>
        <div className='grid grid-cols-[100px,1fr]'>
          <div className='col-[1/2] row-[1] m-1 flex items-center justify-center'>確認番号</div>
          <div className='col-[2/3] row-[1] m-1 flex flex-wrap items-center justify-start text-left'>
            <TextInput
              type='number'
              id='boar_no'
              required={true}
              onChange={inputChanged}
              disabled={inputDisabled}
            />
            <div className='mb-1 ml-1 w-full text-sm text-danger'>{error}</div>
          </div>
        </div>
        <div className='col-[1/3] row-[5]'>
          <div className='mx-auto mt-5 mb-1 max-w-[400px]'>
            <RoundButton color='primary' onClick={handleSubmit} disabled={!buttonEnabled}>
              {buttonLabel}
            </RoundButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default TraceForm;
