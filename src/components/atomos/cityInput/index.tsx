import { useEffect } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { CityInput } from './interface';

const CityInput: React.FunctionComponent<CityInput> = (props) => {
  useEffect(() => {
    // デフォルト値が指定されていない場合はピンの場所から市町村だけ出す
    if (props.defaultValue == null) {
      initForm();
    }
  }, []);

  const initForm = () => {
    const frm = document.getElementById(props.id) as HTMLSelectElement;
    if (frm == null) return;
    getCityName().then((city) => {
      frm.selectedIndex = CITY_LIST.indexOf(city);
    });
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

  const options = [];
  for (let i = 0; i < CITY_LIST.length; i++) {
    options.push(
      <option value={CITY_LIST[i]} key={CITY_LIST[i]}>
        {CITY_LIST[i]}
      </option>,
    );
  }

  return (
    <div className='date-after relative w-full max-w-[400px]'>
      <div
        className={
          'box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg ' +
          (props.error ? 'border-danger bg-input-error-bg' : 'border-border bg-input-bg')
        }
      >
        <select
          className='relative box-border w-full appearance-none rounded-none border-none bg-[transparent] text-lg'
          id={props.id}
          name={props.id}
          onChange={props.onChange}
          defaultValue={props.defaultValue}
        >
          {options}
        </select>
      </div>
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

export default CityInput;
