import { useEffect } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import SelectInput from '../selectInput';
import TextInput from '../TextInput';
import { MeshNoInputProps } from './interface';

const MeshNoInput: React.FunctionComponent<MeshNoInputProps> = (props) => {
  const setValue = (cityValue: string | null, numValue: string | null) => {
    // 市町村名とnum1がnullなら全体もnull
    const meshIdValue = cityValue && numValue ? cityValue + numValue : '';
    (document.getElementById(props.id) as HTMLInputElement).value = meshIdValue;
  };

  const getCityName = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!props.lat || !props.lng) reject('Location not found.');

      const body = {
        geometry: {
          type: 'Point',
          coordinates: [[props.lng, props.lat]],
        },
      };

      try {
        fetch(SERVER_URI + '/Features/GetCity', {
          method: 'POST',
          headers: {
            'X-Access-Token': getAccessToken(),
          },
          body: JSON.stringify(body),
        })
          .then((res) => {
            if (res.status === 200) {
              res
                .json()
                .then((json) => {
                  const features = json['features'];
                  if (features.length !== 0) {
                    resolve(features[0]['properties']['NAME']);
                  } else {
                    reject('City data not found.');
                  }
                })
                .catch((e) => reject(e));
            } else {
              res
                .json()
                .then((json) => {
                  reject(json['error']);
                })
                .catch((e) => reject(e));
            }
          })
          .catch((e) => reject(e));
      } catch (e) {
        reject(`${e}`);
      }
    });
  };

  const initForm = async () => {
    try {
      const city = await getCityName();
      // 表示をセット
      (document.getElementById(props.id + 'City') as HTMLInputElement).value = city;
    } catch (error) {
      console.error(error);
    }
    setValue(null, null);
  };

  useEffect(() => {
    if (props.defaultValue != null) {
      // 正規表現でcity, numを抽出
      const regexp = new RegExp(/^(\D+)(\d{4}-\d{2})$|^(\D+)([A-Fa-f]\d{4})$/, 'g');
      const result = regexp.exec(props.defaultValue);
      if (result == null) {
        // 正規表現に引っかからなかったら，初期値がないときと同じ処理をして終了
        initForm();
        return;
      }
      // 正規表現に引っかかったらそれぞれを取り出して
      const cityValue = result[1] ? result[1] : result[3];
      // cityが一覧に無かったら不正
      if (CITY_LIST.indexOf(cityValue) === -1) {
        // 初期値がないときと同じ処理をして終了
        initForm();
        return;
      }
      const numValue = result[2] ? result[2] : result[4];
      // 内部データのセットと
      setValue(cityValue, numValue);
      // 表示をセット
      (document.getElementById(props.id + 'City') as HTMLInputElement).value = cityValue;
      (document.getElementById(props.id + 'Num') as HTMLInputElement).value = numValue;
    } else {
      // デフォルト値の指定がない場合はピンの場所からメッシュの市町村名を取得する
      initForm();
    }
  }, []);

  const onChangeValue = () => {
    // 入力情報からメッシュIDを作る
    const cityValue = (document.getElementById(props.id + 'City') as HTMLInputElement).value;
    const numValueRow = (document.getElementById(props.id + 'Num') as HTMLInputElement).value;
    // 有効な桁数の時のみセット
    const numRegExp = new RegExp(/(^\d{1,4}-\d{0,2}$)|(^\d{1,4}$)|(^[A-Fa-f]\d{1,4}$)/, 'g');
    const result = numRegExp.exec(numValueRow);
    if (result) {
      // 三項演算子が見づらいですが，
      // result[1]でマッチ → (^\d{1,4}-\d{0,2}$) ＝ 頭0埋めをして4桁-2桁にする
      // result[2]でマッチ → (^\d{1,4}$) ＝ 頭を0埋めし，省略されたハイフンと下二桁(00)を補完
      // result[3]でマッチ → (^[A-Fa-f]\d{1,4}$) = 市町村が使うメッシュ番号，大文字に統一，0埋めして4桁
      const numValue = result[1]
        ? ('0000' + result[1].split('-')[0]).slice(-4) +
          '-' +
          ('00' + result[1].split('-')[1]).slice(-2)
        : result[2]
        ? ('0000' + result[2]).slice(-4) + '-00'
        : result[3]
        ? result[3].slice(0, 1).toUpperCase() + ('0000' + result[3].slice(1)).slice(-4)
        : null;
      console.log(numValue);
      setValue(cityValue, numValue);
    } else {
      setValue(null, null);
    }

    if (props.onChange != null) {
      props.onChange();
    }
  };

  return (
    <div className='relative flex w-full max-w-[400px] flex-wrap items-center text-lg'>
      <div className='box-border grow-[3] basis-[140px]'>
        <SelectInput
          id={props.id + 'City'}
          options={CITY_LIST}
          onChange={onChangeValue}
          error={props.error}
        />
      </div>
      <div className='basis-[3px]'></div>
      <div className='grow-[5] basis-[145px]'>
        <TextInput
          type='text'
          id={props.id + 'Num'}
          placeholder='0000-00 または A0000'
          onChange={onChangeValue}
          isError={props.error}
        />
      </div>
      <br />
      <input type='text' name={props.id} id={props.id} className='hidden' />
    </div>
  );
};

// 市町村名一覧
const CITY_LIST = [
  '安八町',
  '池田町',
  '揖斐川町',
  '恵那市',
  '大垣市',
  '大野町',
  '海津市',
  '各務原市',
  '笠松町',
  '可児市',
  '川辺町',
  '北方町',
  '岐南町',
  '岐阜市',
  '郡上市',
  '下呂市',
  '神戸町',
  '坂祝町',
  '白川町',
  '白川村',
  '関ケ原町',
  '関市',
  '高山市',
  '多治見市',
  '垂井町',
  '土岐市',
  '富加町',
  '中津川市',
  '羽島市',
  '東白川村',
  '飛騨市',
  '七宗町',
  '瑞浪市',
  '瑞穂市',
  '御嵩町',
  '美濃加茂市',
  '美濃市',
  '本巣市',
  '八百津町',
  '山県市',
  '養老町',
  '輪之内町',
];

export default MeshNoInput;
