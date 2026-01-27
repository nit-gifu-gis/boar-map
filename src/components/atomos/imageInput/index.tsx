/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { confirm, alert } from '../../../utils/modal';
import { makeRandStr } from '../../../utils/randStr';
import RoundButton from '../roundButton';
import { ImageInputProps, ImagewithLocation } from './interface';
import EXIF from 'exif-js';
import { useTranslation } from '../../../i18n/useTranslation';

const ImageInput: React.FunctionComponent<ImageInputProps> = (props) => {
  const [error, setError] = useState('');
  const [form_id, setFormId] = useState('');
  const [objURLs, setObjURLs] = useState(props.objectURLs == null ? [] : props.objectURLs);
  const [imgIDs, setImgIDs] = useState(props.imageIDs == null ? [] : props.imageIDs);
  const { t } = useTranslation();

  if (form_id == '') {
    setFormId(makeRandStr(10));
  }

  const makeCompressedImageURL = async (file: File): Promise<ImagewithLocation> => {
    const imgData: ImagewithLocation = {
      objectURL: '',
      location: null,
    };
    // EXIFのパースを行う。
    const arrBuf = await file.arrayBuffer();
    const exif = EXIF.readFromBinaryFile(arrBuf);
    if (exif != null && exif != false) {
      // EXIFが存在する
      const lat_60deg = exif.GPSLatitude;
      const lng_60deg = exif.GPSLongitude;
      if (
        lat_60deg != null &&
        lng_60deg != null &&
        Array.isArray(lat_60deg) &&
        Array.isArray(lng_60deg)
      ) {
        // GPSデータあり (度分秒から10進表機に変換)
        const loc = {
          lat: lat_60deg[0] + lat_60deg[1] / 60 + lat_60deg[2] / 3600,
          lng: lng_60deg[0] + lng_60deg[1] / 60 + lng_60deg[2] / 3600,
        };
        imgData.location = loc;
      }
    }

    return new Promise<ImagewithLocation>((resolve, reject) => {
      if (process.browser) {
        // 圧縮処理
        const imageData = new Image();
        imageData.src = URL.createObjectURL(file);
        imageData.onload = () => {
          // サイズ取得
          const wRow = imageData.width;
          const hRow = imageData.height;
          // 長辺を1024に丸める
          const longSide = wRow > hRow ? wRow : hRow;
          let ratio = 1024.0 / longSide;
          if (ratio > 1.0) ratio = 1.0;
          const w = wRow * ratio;
          const h = hRow * ratio;
          // キャンバスに描画
          const canvas = document.getElementById('canvas_' + form_id) as HTMLCanvasElement;
          if (canvas == null) {
            reject('Canvas is not found.');
            return;
          }
          const ctx = canvas.getContext('2d');
          canvas.setAttribute('width', `${w}`);
          canvas.setAttribute('height', `${h}`);
          if (ctx == null) {
            reject('Context is null');
            return;
          }
          ctx.drawImage(imageData, 0, 0, w, h);
          // Blobを生成

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:next-line
          if (canvas.msToBlob) {
            // msToBlobが実装されているブラウザ(IE/レガシーEdge)ではこの方法
            // dataURLを生成
            const url = canvas.toDataURL('image/jpeg', 0.5);
            // blobを生成
            const bin = atob(url.replace(/^.*,/, ''));
            const buffer = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) {
              buffer[i] = bin.charCodeAt(i);
            }
            const blob = new Blob([buffer.buffer], { type: 'image/png' });
            // objectURLを生成
            const objectURL = URL.createObjectURL(blob);
            imgData.objectURL = objectURL;
            resolve(imgData);
          } else {
            // モダンブラウザはcanvasから直接blobが作れる
            canvas.toBlob(
              (blob) => {
                const objectURL = URL.createObjectURL(blob as Blob);
                imgData.objectURL = objectURL;
                resolve(imgData);
              },
              'image/jpeg',
              0.5,
            );
          }
        };
        imageData.onerror = (e) => reject(e);
      } else {
        reject('window is not defined.');
      }
    });
  };

  const formChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) return;
    setError('');
    if (objURLs.length + imgIDs.length + e.target.files.length > props.max_count) {
      await alert('一度に登録できる画像は' + props.max_count + '枚までです。');
      return;
    }

    const newURLs: ImagewithLocation[] = [];
    for (const file of e.target.files) {
      const url = await makeCompressedImageURL(file);
      newURLs.push(url);
    }

    const newList = objURLs.concat(newURLs);
    if (props.onChange != null) props.onChange(newList);
    setObjURLs(newList);
  };

  const onClickSelect = () => {
    const fileForm = document.getElementById('file_' + form_id) as HTMLInputElement;
    if (fileForm == null) return;

    fileForm.value = '';
    fileForm.click();
  };

  const onClickDeleteLocalImage = async (index: number) => {
    if (await confirm('この画像の登録を取り消しますか？')) {
      const newList = objURLs.filter((f) => f != objURLs[index]);
      URL.revokeObjectURL(objURLs[index].objectURL); // メモリの開放
      if (props.onChange != null) props.onChange(newList);
      setObjURLs(newList);
    }
  };

  const onClickDeleteRemoteImage = async (index: number) => {
    if (await confirm('この画像を削除しますか？')) {
      const newList = imgIDs.filter((f) => f != imgIDs[index]);
      if (props.onServerImageDeleted != null) props.onServerImageDeleted(newList);
      setImgIDs(newList);
    }
  };

  // 配列の要素を移動させる関数
  const moveElement = <T,>(array: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newList = [...array];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // 範囲外チェック
    if (targetIndex < 0 || targetIndex >= newList.length) return newList;

    // 要素の入れ替え
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    return newList;
  };

  // サーバー画像の移動
  const onMoveRemoteImage = (index: number, direction: 'up' | 'down') => {
    const newList = moveElement(imgIDs, index, direction);
    setImgIDs(newList);
    // 必要であれば親コンポーネントに通知（propsにonOrderChangeなどがあれば）
    if (props.onServerImageDeleted != null) props.onServerImageDeleted(newList);
  };

  // ローカル画像の移動
  const onMoveLocalImage = (index: number, direction: 'up' | 'down') => {
    const newList = moveElement(objURLs, index, direction);
    setObjURLs(newList);
    if (props.onChange != null) props.onChange(newList);
  };

  const previewChildren: JSX.Element[] = [];
  const token = getAccessToken();

  // 1. もともと登録されている画像（サーバー側）
  for (let i = 0; i < imgIDs.length; i++) {
    const previewChild = (
      <div className='img-preview relative w-full mb-4' key={'Remote-' + imgIDs[i]}>
        <img
          className='w-full cursor-pointer'
          src={SERVER_URI + '/Image/GetImage?id=' + imgIDs[i] + '&token=' + token}
          alt={'Uploaded image ' + (i + 1)}
          onClick={() =>
            window.open(
              '/image?id=' + encodeURIComponent(imgIDs[i]),
              'img_' + imgIDs[i],
              'width=800,height=600',
            )
          }
        />
        {/* 削除ボタン */}
        <div className="absolute -top-[5px] -right-[5px] flex flex-col gap-[5px] z-30">
          <button
            type='button'
            className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-xl font-bold text-text z-10'
            onClick={onClickDeleteRemoteImage.bind(this, i)}
          > × </button>

          {/* 上移動ボタン */}
          {i > 0 && (
            <button
              type='button'
              className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-sm font-bold text-text z-10'
              onClick={() => onMoveRemoteImage(i, 'up')}
            > ▲ </button>
          )}

          {/* 下移動ボタン */}
          {i < imgIDs.length - 1 && (
            <button
              type='button'
              className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-sm font-bold text-text z-10'
              onClick={() => onMoveRemoteImage(i, 'down')}
            > ▼ </button>
          )}
        </div>
      </div>
    );
    previewChildren.push(previewChild);
  }

  // 2. ローカルの画像（アップロード前）
  for (let i = 0; i < objURLs.length; i++) {
    const previewChild = (
      <div className='img-preview relative w-full mb-4' key={'Local-' + i}>
        <img className='w-full' src={objURLs[i].objectURL} alt={'Local image ' + (i + 1)} />

        <div className="absolute -top-[5px] -right-[5px] flex flex-col gap-[5px]">
          <button
            type='button'
            className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-xl font-bold text-text z-10'
            onClick={onClickDeleteLocalImage.bind(this, i)}
          > × </button>
          {i > 0 && (
            <button
              type='button'
              className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-sm font-bold text-text z-10'
              onClick={() => onMoveLocalImage(i, 'up')}
            > ▲ </button>
          )}
          {i < objURLs.length - 1 && (
            <button
              type='button'
              className='shadow-2 box-border h-[30px] w-[30px] rounded-[30px] bg-background text-center text-sm font-bold text-text z-10'
              onClick={() => onMoveLocalImage(i, 'down')}
            > ▼ </button>
          )}
        </div>
      </div>
    );
    previewChildren.push(previewChild);
  }

  return (
    <div
      className={
        'box-boder w-full rounded-[10px] border-2 border-solid p-[10px] text-lg ' +
        (error === '' ? 'border-border bg-input-bg' : 'border-danger bg-input-error-bg')
      }
    >
      <form name={'imageinput_' + form_id} className='w-full text-center'>
        <input
          type='file'
          name='file'
          id={'file_' + form_id}
          accept='image/png,image/jpeg'
          multiple={!props.single_file}
          onChange={formChanged.bind(this)}
          className='hidden'
          placeholder="file input"
        />
      </form>
      <div className='w-full'>{previewChildren}</div>
      <canvas className='hidden' id={'canvas_' + form_id}></canvas>
      <div className='w-full text-center'>
        <RoundButton color='primary' onClick={onClickSelect.bind(this)}>
          {t('select-img-btn')}
        </RoundButton>
      </div>
    </div>
  );
};

export default ImageInput;
