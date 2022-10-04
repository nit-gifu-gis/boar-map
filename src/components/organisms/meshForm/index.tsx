import React, { useState } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import RoundButton from '../../atomos/roundButton';
import SelectInput from '../../atomos/selectInput';
import Image from 'next/image';
import { MeshFormInterface } from './interface';
import { alert } from '../../../utils/modal';

const MeshForm: React.FunctionComponent<MeshFormInterface> = ({ maxSize }) => {
  const [isUploading, setUploading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('インポート');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exts, setExts] = useState<string[]>([]);
  const [name, setName] = useState('');

  const onClickImport = async () => {
    const fileForm = document.getElementById('importMesh') as HTMLInputElement;
    if (fileForm.files == null || fileForm.files?.length === 0) {
      setError('ファイルが選択されていません。');
      return;
    }

    const fileType = document.getElementById('importType') as HTMLSelectElement;

    const data = new FormData();
    data.append('mesh', fileForm.files[0]);
    data.append('type', fileType.options[fileType.selectedIndex].value as string);

    setError('');
    setMessage('');
    setButtonLabel('アップロード中...');
    setUploading(true);

    const res = await fetch(SERVER_URI + '/Mesh/Import', {
      method: 'POST',
      body: data,
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    const resp = await res.json();
    if (res.status !== 200) {
      setError(resp.error);
      if (resp.exts != undefined) {
        setExts(resp.exts);
        setName(resp.name);
      }
      setUploading(false);
      setButtonLabel('アップロード');
      return;
    }

    setMessage(resp.message);
    setUploading(false);
    setButtonLabel('アップロード');
  };

  const requiredFiles: { [key: string]: string } = {
    '.SHP': '図形の情報を格納する主ファイルです。',
    '.SHX': '図形のインデックス情報を格納するファイルです。',
    '.DBF': '図形の属性情報を格納するファイルです。',
    '.PRJ': '図形の座標系の定義情報を格納するファイルです。',
  };

  const fileFormChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const form = e.target as HTMLInputElement;
    if (!form.files || !form.files.length || !maxSize) {
      return;
    }
    const file = form.files[0];
    if (maxSize.max_size_raw <= file.size) {
      alert(`ファイルサイズが${maxSize.max_size} ${maxSize.unit}を超過しています。`);
      form.value = '';
    }
  };

  return (
    <div className='mb-[30px] w-full'>
      <div className='text-2xl font-bold'>メッシュデータインポート</div>
      <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
        <div className='grid grid-cols-[150px_1fr]'>
          <div className='col-[1/2] row-[3] m-1 flex items-center justify-center'>
            メッシュタイプ
          </div>
          <div className='col-[2/3] row-[3] m-1 flex flex-wrap items-center justify-start text-left'>
            <SelectInput
              id='importType'
              options={['ワクチンメッシュ', 'ハンターメッシュ']}
              defaultValue={'ワクチンメッシュ'}
              error={false}
            />
          </div>
          <div className='col-[1/2] row-[4] m-[5px] flex items-center justify-center'>
            メッシュデータ
          </div>
          <div className='col-[2/3] row-[4] m-[5px] flex flex-wrap items-center justify-start text-left'>
            <input
              type='file'
              name='importMesh'
              id='importMesh'
              accept='application/zip'
              onChange={fileFormChanged}
            />
          </div>
          <div className='col-[2/3] row-[5] text-sm'>
            .SHP, .SHX, .DBF, .PRJの拡張子を持つファイルを含んだzipファイルを選択して下さい。
            <br />
            (zipファイル内に.CPGファイルがない場合、正常に読み込めない場合があるため追加することを推奨します。)
          </div>
          <div className='col-[2/3] row-[6] m-[5px] flex flex-wrap items-center justify-start text-left'>
            <span className='text-sm'>
              {maxSize == null ? '' : `最大ファイルサイズ: ${maxSize.max_size} ${maxSize.unit}`}
            </span>
          </div>
          <div className='col-[1/3] row-[7]'>
            <div className='mx-auto my-5 max-w-[400px]'>
              <RoundButton color='accent' onClick={onClickImport} disabled={isUploading}>
                {buttonLabel}
              </RoundButton>
            </div>
          </div>
          <div className='col-[1/3] row-[8] mt-3 text-center'>
            {error === 'file_missing' ? (
              <div>
                <span className='font-bold text-danger'>
                  必要なファイルが不足しています。
                  <br />
                  下の表を確認し、再度アップロードしてください。
                </span>
                <div className='my-2 flex justify-center'>
                  <table className='border-collapse whitespace-pre'>
                    <tbody className='table'>
                      <tr>
                        <th className={'border border-b-2 border-solid border-border p-1'}>#</th>
                        <th className={'border border-b-2 border-solid border-border p-1'}>状態</th>
                        <th className={'border border-b-2 border-solid border-border p-1'}>
                          ファイル名
                        </th>
                        <th className={'border border-b-2 border-solid border-border p-1'}>説明</th>
                      </tr>
                      {exts.map((ext, i) => (
                        <tr key={'Missing ' + (i + 1)}>
                          <td className='border border-solid border-border p-1 text-center'>
                            {i + 1}
                          </td>
                          <td className='border border-solid border-border p-1 text-center'>
                            <div className='flex items-center'>
                              <Image
                                src='/static/images/ng_icon.png'
                                width={16}
                                height={16}
                                alt='NG icon'
                              />
                              <span className='ml-1'>NG</span>
                            </div>
                          </td>
                          <td className='border border-solid border-border p-1 text-left'>
                            {name}
                            {ext}
                          </td>
                          <td className='border border-solid border-border p-1 text-left'>
                            {requiredFiles[ext]}
                          </td>
                        </tr>
                      ))}
                      {Object.keys(requiredFiles)
                        .filter((e) => !exts.includes(e))
                        .map((ext, i) => (
                          <tr key={'Found' + (i + 1)}>
                            <td className='border border-solid border-border p-1 text-center'>
                              {i + exts.length + 1}
                            </td>
                            <td className='border border-solid border-border p-1 text-center'>
                              <div className='flex items-center'>
                                <Image
                                  src='/static/images/ok_icon.png'
                                  width={16}
                                  height={16}
                                  alt='OK icon'
                                />
                                <span className='ml-1'>OK</span>
                              </div>
                            </td>
                            <td className='border border-solid border-border p-1 text-left'>
                              {name}
                              {ext}
                            </td>
                            <td className='border border-solid border-border p-1 text-left'>
                              {requiredFiles[ext]}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <span className={'font-bold' + (error != '' ? ' text-danger' : '')}>
                {error != '' ? error : message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeshForm;
