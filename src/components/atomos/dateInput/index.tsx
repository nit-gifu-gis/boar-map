import { useEffect, useState } from 'react';
import { getBrowser, getDevice } from '../../../utils/browser';
import TextInput from '../TextInput';
import { DateInputProps } from './interface';

const DateInput: React.FunctionComponent<DateInputProps> = (props) => {
  const [isSafari, setIsSafari] = useState(false);

  const onChangeValueForSafari = () => {
    const yearValue = (document.getElementById(props.id + 'Year') as HTMLInputElement).value;
    const monthValue = (document.getElementById(props.id + 'Month') as HTMLInputElement).value;
    const dayValue = (document.getElementById(props.id + 'Day') as HTMLInputElement).value;
    setDate(yearValue, monthValue, dayValue);
    if (props.onChange != null) props.onChange();
  };

  const setDate = (year: string, month: string, day: string) => {
    // 空文字がある場合はエラー
    // 年が4桁じゃ無いのもエラー
    if ((year + '').length != 4 || month + '' == '' || day + '' == '') {
      // 未入力欄がある場合
      (document.getElementById(props.id) as HTMLInputElement).value = '';
      return;
    }
    const yyyy = ('0000' + year).slice(-4);
    const mm = ('00' + month).slice(-2);
    const dd = ('00' + day).slice(-2);
    const date = yyyy + '-' + mm + '-' + dd;
    // window.alert(date);
    // 全部空文字じゃ無いなら日付として正しいか判定
    const dt = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    if (
      dt.getFullYear() == parseInt(yyyy) &&
      dt.getMonth() == parseInt(mm) - 1 &&
      dt.getDate() == parseInt(dd)
    ) {
      (document.getElementById(props.id) as HTMLInputElement).value = date;
    } else {
      (document.getElementById(props.id) as HTMLInputElement).value = '';
    }
  };

  const confirmSafari = () => {
    const isSafari = () => {
      const device = getDevice();
      // PC以外は大丈夫
      if (device !== 'mac' && device !== 'windows_pc') return false;
      // ieとsafariだけtrue
      const browser = getBrowser();
      if (browser === 'ie' || browser === 'safari') return true;
      else return false;
    };

    const res = isSafari();
    setIsSafari(res);
  };

  const initForm = () => {
    // 必須の場合のみ初期化する。
    if (props.required) {
      const today = new Date();
      const yearValue = ('0000' + today.getFullYear()).slice(-4);
      const monthValue = ('00' + (today.getMonth() + 1)).slice(-2);
      const dayValue = ('00' + today.getDate()).slice(-2);
      setDate(yearValue, monthValue, dayValue);
      if (isSafari) {
        (document.getElementById(props.id + 'Year') as HTMLInputElement).value = yearValue;
        (document.getElementById(props.id + 'Month') as HTMLInputElement).value = monthValue;
        (document.getElementById(props.id + 'Day') as HTMLInputElement).value = dayValue;
      }
    }
  };

  useEffect(() => {
    confirmSafari();
    // 初期値の確認
    if (props.date != null) {
      // 正規表現でチェック，区切りは"-"または"/"
      const regexp = new RegExp('(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})', 'g');
      const result = regexp.exec(props.date);
      if (result == null) {
        // 正規表現に引っかからないなら，初期値なしのときの処理
        initForm();
        return;
      }
      // 引っかかったらそれぞれ取り出して
      const yearValue = result[1];
      const monthValue = result[2];
      const dayValue = result[3];
      // 内部データセット
      setDate(yearValue, monthValue, dayValue);
      // safariは見た目もセット
      if (isSafari) {
        (document.getElementById(props.id + 'Year') as HTMLInputElement).value = yearValue;
        (document.getElementById(props.id + 'Month') as HTMLInputElement).value = monthValue;
        (document.getElementById(props.id + 'Day') as HTMLInputElement).value = dayValue;
      }
      return;
    } else {
      // 初期値なし
      initForm();
      return;
    }
  }, [isSafari]);

  return isSafari ? (
    <div className='flex w-full max-w-[400px] p-0 text-lg'>
      <div className='flex items-center '>
        <div>
          <TextInput
            type='number'
            min={1900}
            step={1}
            id={props.id + 'Year'}
            onChange={onChangeValueForSafari.bind(this)}
            isError={props.error}
            disabled={props.disabled}
          />
        </div>
        年
      </div>
      <div className='flex items-center '>
        <div>
          <TextInput
            type='number'
            max={12}
            min={1}
            step={1}
            id={props.id + 'Month'}
            onChange={onChangeValueForSafari.bind(this)}
            isError={props.error}
            disabled={props.disabled}
          />
        </div>
        月
      </div>
      <div className='flex items-center '>
        <div>
          <TextInput
            type='number'
            max={31}
            min={1}
            step={1}
            id={props.id + 'Day'}
            onChange={onChangeValueForSafari.bind(this)}
            isError={props.error}
            disabled={props.disabled}
          />
        </div>
        日
      </div>
      <br />
      <input
        type='date'
        name={props.id}
        id={props.id}
        min={props.min}
        max={props.max}
        disabled={props.disabled}
        style={{ display: 'none' }}
      />
    </div>
  ) : (
    <div className='date-after relative w-full'>
      <input
        type='date'
        className={
          'box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg ' +
          (props.error ? 'border-danger bg-input-error-bg' : 'border-border bg-input-bg')
        }
        name={props.id}
        id={props.id}
        placeholder={'年/月/日'}
        onChange={() => {
          if (props.onChange != null) props.onChange();
        }}
        min={props.min}
        max={props.max}
        disabled={props.disabled}
      />
    </div>
  );
};

export default DateInput;
