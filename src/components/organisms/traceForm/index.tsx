import React, { useState } from 'react';

import RoundButton from '@/components/atomos/roundButton';
import TextInput from '@/components/atomos/TextInput';
import { checkLuhn } from '@/utils/jibie';

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
    // 現在入力されている値をそのまま送信
    await onSubmit(boarNo);
    setInputDisabled(false);
    setButtonEnabled(true);
    setButtonLabel('検索');
  };

  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setBoarNo(value); // 入力値をステートに即時反映

    if (value === '') {
      setError('');
      setButtonEnabled(false);
      return;
    }

    // --- バリデーションロジック ---

    // 1. 確認番号（数字のみ）の場合の判定
    const isAllNumbers = /^\d+$/.test(value);

    if (isAllNumbers) {
      if (value.length < 9) {
        setError(''); // 桁数が足りない間はエラーを出さず、ボタンも押せない
        setButtonEnabled(false);
        return;
      }
      if (value.length === 9) {
        if (checkLuhn(value)) {
          setError('');
          setButtonEnabled(true);
        } else {
          setError('確認番号が正しくありません。');
          setButtonEnabled(false);
        }
        return;
      }
      if (value.length > 9) {
        setError('確認番号の桁数が多すぎます。');
        setButtonEnabled(false);
        return;
      }
    }

    // 2. 個体管理番号（英字を含む）の場合の判定
    // 例: TGK125001 (英数字混在、長さ制限なし〜適度な長さ)
    const isManagementId = /^[A-Z0-9-]+$/i.test(value);
    if (isManagementId) {
      // 英字が含まれていれば、個体管理番号として最低限の長さを条件にする（例: 3文字以上）
      if (value.length >= 3) {
        setError('');
        setButtonEnabled(true);
      } else {
        setButtonEnabled(false);
      }
      return;
    }

    // どちらの形式にも当てはまらない場合
    setError('無効な文字が含まれています。');
    setButtonEnabled(false);
  };

  return (
    <>
      <div className='text-2xl font-bold'>検索条件</div>
      <div className='mb-8 box-border w-full rounded-xl border-2 border-solid border-border py-3 px-4'>
        <div className='grid grid-cols-[100px,1fr]'>
          <div className='col-[1/2] row-[1] m-1 flex items-center justify-center text-sm'>
            確認番号 /<br />個体管理番号
          </div>
          <div className='col-[2/3] row-[1] m-1 flex flex-wrap items-center justify-start text-left'>
            <TextInput
              type='text' // 英字入力のため text に変更
              id='boar_no'
              placeholder='例: 231234567 または TGK125001'
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