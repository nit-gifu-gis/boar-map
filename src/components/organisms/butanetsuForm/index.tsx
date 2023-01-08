import React, { useState } from 'react';
import RoundButton from '../../atomos/roundButton';
import SelectInput from '../../atomos/selectInput';
import Image from 'next/image';
import { MeshFormInterface } from './interface';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';

const ButanetsuForm: React.FunctionComponent<MeshFormInterface> = ({ maxSize }) => {
  const [isUploading, setUploading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('インポート');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onClickImport = () => {
    setUploading(true);
    setButtonLabel("インポート中...")

    /** インポート処理をここに書く */
    setError("アップロード処理を実装してください。")

    setButtonLabel("インポート")
    setUploading(false);
  }

  const fileFormChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const form = e.target as HTMLInputElement;
    if (!form.files || !form.files.length || !maxSize) {
      return;
    }
    const file = form.files[0];
    if (maxSize.max_size_raw <= file.size) {
      alert(
        `ファイルサイズが${maxSize.max_size} ${maxSize.unit}を超過しています。\n他のシートを削除して再度お試しください。`,
      );
      form.value = '';
    }
  };

  const onClickDownload = async () => {
    const res = await fetch(SERVER_URI + '/List/ButanetsuDownload', {
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });

    if (res.status === 200) {
      const blob = await res.blob();
      const anchor = document.createElement('a');
      const now = new Date();
      const yyyy = ('0000' + now.getFullYear()).slice(-4);
      const mm = ('00' + (now.getMonth() + 1)).slice(-2);
      const dd = ('00' + now.getDate()).slice(-2);

      const name = '豚熱陽性確認情報テンプレート.xlsx';
      // IE対応
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.navigator.msSaveBlob) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.navigator.msSaveBlob(blob, name);
        return;
      }
      anchor.download = name;
      anchor.href = window.URL.createObjectURL(blob);
      anchor.click();
    } else {
      const json = await res.json();
      await alert(json.error);
    }
  }

  return (
    <div className='mb-[30px] w-full'>
      <div className='text-2xl font-bold'>豚熱陽性確認情報インポート</div>
      <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
        <div className='grid grid-cols-[150px_1fr]'>
          <div className='col-[1/2] row-[4] m-[5px] flex items-center justify-center'>
            Excelファイル
          </div>
          <div className='col-[2/3] row-[4] m-[5px] flex flex-wrap items-center justify-start text-left'>
            <input
              type='file'
              name='importExcel'
              id='importExcel'
              accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              onChange={fileFormChanged}
            />
          </div>
          <div className='col-[2/3] row-[5] m-[5px] flex flex-wrap items-center justify-start text-left'>
            <span className='text-sm'>
              {maxSize == null ? '' : `最大ファイルサイズ: ${maxSize.max_size} ${maxSize.unit}`}
            </span>
          </div>
          <div className='col-[1/3] row-[6]'>
            <div className='mx-auto my-5 max-w-[400px]'>
              <RoundButton color='accent' onClick={onClickDownload}>
                テンプレートダウンロード
              </RoundButton>
            </div>
            <div className='mx-auto my-5 max-w-[400px]'>
              <RoundButton color='excel' onClick={onClickImport} disabled={isUploading}>
                {buttonLabel}
              </RoundButton>
            </div>
          </div>
          <div className='col-[1/3] row-[7] mt-3 text-center'>
            <span className={'font-bold' + (error != '' ? ' text-danger' : '')}>
              {error != '' ? error : message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButanetsuForm;
