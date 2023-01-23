import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { alert } from '../../../utils/modal';
import DateInput from '../../atomos/dateInput';
import RoundButton from '../../atomos/roundButton';
import SelectInput from '../../atomos/selectInput';
import TextInput from '../../atomos/TextInput';
import { SearchFormProps } from './interface';

const SearchForm: React.FunctionComponent<SearchFormProps> = ({ onClick }) => {
  const { currentUser } = useCurrentUser();
  const [dateError, setDateError] = useState(false);
  const [dataType, setDataType] = useState('いのしし捕獲地点');
  const [searching, setSearching] = useState(false);
  const [typeList, setTypeList] = useState<string[]>(['']);

  const dateLabelList: { [key: string]: string } = {
    いのしし捕獲地点: '捕獲年月日',
    わな設置地点: '設置年月日',
    ワクチン散布地点: '散布年月日',
    作業日報: '作業日',
  };

  useEffect(() => {
    if (!currentUser) return;

    const list: string[] = [];
    if (currentUser.userDepartment !== 'Y' && currentUser.userDepartment !== 'W')
      list.push('いのしし捕獲地点');
    if (
      currentUser.userDepartment !== 'Y' &&
      currentUser.userDepartment !== 'W' &&
      currentUser.userDepartment !== 'J'
    )
      list.push('わな設置地点');
    list.push('ワクチン散布地点');
    if (
      currentUser.userDepartment === 'T' ||
      currentUser.userDepartment === 'R' ||
      currentUser.userDepartment === 'K'
    )
      list.push('作業日報');
    setDataType(list[0]);
    setTypeList(list);
  }, [currentUser]);

  const validateDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (d1 <= d2) {
      return true;
    } else {
      return false;
    }
  };

  const onClickSearch = async () => {
    setDateError(false);
    const date1 = (document.getElementById('date1') as HTMLInputElement).value;
    const date2 = (document.getElementById('date2') as HTMLInputElement).value;
    if (!validateDate(date1, date2)) {
      alert('日付の前後が間違っています。');
      setDateError(true);
      return;
    }

    setSearching(true);
    const citiesInput = document.getElementById('cities') as HTMLInputElement;
    const citiesStr = citiesInput !== null ? citiesInput.value : '';
    const cities = citiesStr
      .split(/[\s\n,.，．、。]/)
      .filter((e) => e)
      .join(',');
    const divisionInput = document.getElementById('division') as HTMLInputElement;
    const division = divisionInput !== null ? divisionInput.value : '';
    const dataTypeStr = (document.getElementById('division_type') as HTMLSelectElement).value;
    // ファイルを取得しておく
    const userList = (document.getElementById('userList') as HTMLInputElement).files as FileList;
    const data = new FormData();
    data.append('fromDate', date1);
    data.append('toDate', date2);
    data.append('cities', cities);
    data.append('divisions', division);
    data.append('type', dataTypeStr);
    if (userList.length !== 0) {
      data.append('userList', userList[0]);
    }

    await onClick(data);
    setSearching(false);
  };

  return (
    <div className='mb-8 w-full'>
      <div className='text-2xl font-bold'>検索条件</div>
      <div className='box-border w-full rounded-[10px] border-2 border-solid border-border py-[10px] px-3'>
        <div className='grid grid-cols-[100px_1fr]'>
          <div className='col-[1/2] row-[1] m-1 flex items-center justify-center'>情報の種類</div>
          <div className='col-[2/3] row-[1] m-1 flex flex-wrap items-center justify-start text-left'>
            <SelectInput
              id='division_type'
              options={typeList}
              onChange={() =>
                setDataType((document.getElementById('division_type') as HTMLInputElement).value)
              }
              defaultValue={typeList[0]}
              error={false}
            />
          </div>
          <div className='col-[1/2] row-[2] m-1 flex items-center justify-center'>
            {dateLabelList[dataType]}
          </div>
          <div className='col-[2/3] row-[2] m-1 flex flex-wrap items-center justify-start text-left'>
            <div className='flex-[0_1_300px]'>
              <DateInput id='date1' error={dateError} required={true} />
            </div>
            <div className='mx-1 flex-[0_0_auto]'>～</div>
            <div className='flex-[0_1_300px]'>
              <DateInput id='date2' error={dateError} required={true} />
            </div>
          </div>
          {dataType === '作業日報' ? (
            <>
              <div className='col-[1/2] row-[3] m-1 flex items-center justify-center'>地域</div>
              <div className='col-[2/3] row-[3] m-1 flex flex-wrap items-center justify-start text-left'>
                <SelectInput
                  id='cities'
                  options={[
                    'すべて',
                    '岐阜',
                    '西濃',
                    '揖斐',
                    '中濃',
                    '郡上',
                    '可茂',
                    '東濃',
                    '恵那',
                    '下呂',
                    '飛騨',
                  ]}
                  defaultValue={'すべて'}
                  error={false}
                />
              </div>
            </>
          ) : dataType === 'いのしし捕獲地点' ? (
            <>
              <div className='col-[1/2] row-[3] m-1 flex items-center justify-center'>市町村</div>
              <div className='col-[2/3] row-[3] m-1 flex flex-wrap items-center justify-start text-left'>
                <TextInput id='cities' type='text' />
                <div className='col-[2/3] m-1 flex flex-wrap items-center justify-start text-left text-sm text-small-text'>
                  「市」「町」「村」まで入力してください。スペース区切りで複数選択もできます。
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
          {dataType === 'いのしし捕獲地点' ? (
            <>
              <div className='col-[1/2] row-[4] m-1 flex items-center justify-center'>区分</div>
              <div className='col-[2/3] row-[4] m-1 flex flex-wrap items-center justify-start text-left'>
                <SelectInput
                  id='division'
                  options={['すべて', '調査捕獲', '有害捕獲', '死亡', '狩猟', 'その他']}
                  defaultValue={'すべて'}
                  error={false}
                />
              </div>
            </>
          ) : (
            <></>
          )}
          <div className='col-[1/2] row-[5] m-1 flex items-center justify-center'>名前一覧表</div>
          <div className='col-[2/3] row-[5] m-1 flex flex-wrap items-center justify-start text-left'>
            <input
              type='file'
              name='userList'
              id='userList'
              accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            />
          </div>
          <div className='col-[1/3] row-[6] mx-auto w-full'>
            <div className='mx-auto mt-[20px] mb-1 w-full max-w-[400px]'>
              <RoundButton color='primary' onClick={onClickSearch} disabled={searching}>
                検索
              </RoundButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
