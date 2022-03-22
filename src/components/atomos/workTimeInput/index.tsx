import { useEffect, useState } from 'react';
import InfoInput from '../../molecules/infoInput';
import SelectInput from '../selectInput';
import { WorkTimeInputProps } from './interface';

const WorkTimeInput: React.FunctionComponent<WorkTimeInputProps> = (props) => {
  const getNendoYears = (date?: Date) => {
    const today = date == null ? new Date() : date;
    const month = today.getMonth() + 1;
    if (1 <= month && month <= 3) {
      return [``, `${today.getFullYear() - 1}`, `${today.getFullYear()}`];
    } else {
      return [``, `${today.getFullYear()}`, `${today.getFullYear() + 1}`];
    }
  };

  const getTimeList = () => {
    const list = [''];
    for (let i = 4; i <= 18; i++) {
      if (i != 4 && i != 18) list.push(`${i}:00`);
      list.push(`${i}:30`);
    }
    return list;
  };

  const isLeapYear = (year: number) => year % 4 === 0 && !(year % 100 === 0 && year % 400 !== 0);
  const [parsingDefault, setParsingDefault] = useState(true);
  const [nendoYears, setNendoYears] = useState<string[]>([]);
  const [days, setDays] = useState(['']);

  useEffect(() => {
    const yearSel = document.getElementById(props.id + 'Year') as HTMLSelectElement;
    const monthSel = document.getElementById(props.id + 'Month') as HTMLSelectElement;
    const daySel = document.getElementById(props.id + 'Day') as HTMLSelectElement;
    const startSel = document.getElementById(props.id + 'Start') as HTMLSelectElement;
    const endSel = document.getElementById(props.id + 'End') as HTMLSelectElement;
    if (nendoYears.length == 0) {
      if (!props.defaultStart || !props.defaultEnd) {
        setNendoYears(getNendoYears());
      } else {
        const startDate = new Date(props.defaultStart);
        const nendoList = getNendoYears(startDate);
        setNendoYears(nendoList);
        // 月
        monthSel.selectedIndex = startDate.getMonth() + 1;

        const year_n = startDate.getFullYear();
        const month_n = startDate.getMonth() + 1;
        const dayList = [...Array(28)].map((v, i) => `${i + 1}`);
        dayList.unshift('');
        if (month_n === 2) {
          // 2月で、うるう年の場合は29を足す
          if (isLeapYear(year_n)) {
            dayList.push('29');
          }
        } else if (month_n === 4 || month_n === 6 || month_n === 9 || month_n == 11) {
          // 30日までの月
          dayList.push('29');
          dayList.push('30');
        } else {
          // 31日までの月
          dayList.push('29');
          dayList.push('30');
          dayList.push('31');
        }
        setDays(dayList);
        return;
      }
    }

    if (!parsingDefault) return;

    if (days.length) {
      setParsingDefault(false);
      if (!props.defaultStart || !props.defaultEnd) return;
      const startDate = new Date(props.defaultStart);
      const endDate = new Date(props.defaultEnd);

      // 年
      yearSel.selectedIndex = nendoYears.indexOf(`${startDate.getFullYear()}`);

      // 日
      daySel.selectedIndex = startDate.getDate();

      const timeList = getTimeList();
      // 開始
      startSel.selectedIndex = timeList.indexOf(
        `${startDate.getHours()}:${startDate.getMinutes() === 0 ? '00' : '30'}`,
      );
      // 終了
      endSel.selectedIndex = timeList.indexOf(
        `${endDate.getHours()}:${endDate.getMinutes() === 0 ? '00' : '30'}`,
      );

      onChangeValue();
    }
  }, [parsingDefault, days, nendoYears]);

  const onChangeYearMonth = () => {
    // 日付のリストを変化させる
    const yearSel = document.getElementById(props.id + 'Year') as HTMLSelectElement;
    const monthSel = document.getElementById(props.id + 'Month') as HTMLSelectElement;
    const daySel = document.getElementById(props.id + 'Day') as HTMLSelectElement;

    const year = yearSel.options[yearSel.selectedIndex].value as string;
    const month = monthSel.options[monthSel.selectedIndex].value as string;

    if (year == '' || month == '') {
      setDays(['']);
    } else {
      const year_n = parseInt(
        (document.getElementById(props.id + 'Year') as HTMLInputElement).value as string,
      );
      const month_n = parseInt(
        (document.getElementById(props.id + 'Month') as HTMLInputElement).value as string,
      );
      const dayList = [...Array(28)].map((v, i) => `${i + 1}`);
      dayList.unshift('');
      if (month_n === 2) {
        // 2月で、うるう年の場合は29を足す
        if (isLeapYear(year_n)) {
          dayList.push('29');
        }
      } else if (month_n === 4 || month_n === 6 || month_n === 9 || month_n == 11) {
        // 30日までの月
        dayList.push('29');
        dayList.push('30');
      } else {
        // 31日までの月
        dayList.push('29');
        dayList.push('30');
        dayList.push('31');
      }
      setDays(dayList);
      if (daySel.selectedIndex >= dayList.length) daySel.selectedIndex = dayList.length - 1;
    }
    onChangeValue();
  };

  const onChangeValue = () => {
    const start_div = document.getElementById(props.id + '_start') as HTMLInputElement;
    const end_div = document.getElementById(props.id + '_end') as HTMLInputElement;

    const yearSel = document.getElementById(props.id + 'Year') as HTMLSelectElement;
    const monthSel = document.getElementById(props.id + 'Month') as HTMLSelectElement;
    const daySel = document.getElementById(props.id + 'Day') as HTMLSelectElement;
    const startSel = document.getElementById(props.id + 'Start') as HTMLSelectElement;
    const endSel = document.getElementById(props.id + 'End') as HTMLSelectElement;

    const yearVal = yearSel.options[yearSel.selectedIndex].value as string;
    const monthVal = monthSel.options[monthSel.selectedIndex].value as string;
    const dayVal =
      daySel.options[daySel.selectedIndex] == null
        ? ''
        : (daySel.options[daySel.selectedIndex].value as string);
    const startVal = startSel.options[startSel.selectedIndex].value as string;
    const endVal = endSel.options[endSel.selectedIndex].value as string;

    if (!yearVal || !monthVal || !dayVal || !startVal || !endVal) {
      // どれか一つでもかけてたら未入力と一緒
      start_div.value = '';
      end_div.value = '';
    } else {
      start_div.value = `${yearVal}/${monthVal}/${dayVal} ${startVal}:00`;
      end_div.value = `${yearVal}/${monthVal}/${dayVal} ${endVal}:00`;
    }

    if (props.onChange != null) props.onChange();
  };

  return (
    <div className='m-[15px]'>
      <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
        作業時間
        {props.required ? <span className='ml-[5px] font-bold text-danger'>*</span> : <></>}
      </div>
      {props.error != null ? (
        <div className='-mt-[5px] mb-[5px] w-full text-sm text-danger'>{props.error}</div>
      ) : (
        <></>
      )}
      <div>
        <input type='text' id={props.id + '_start'} className='hidden' />
        <input type='text' id={props.id + '_end'} className='hidden' />
        <div className='mb-4 flex justify-between'>
          <div className='box-border flex basis-[40%] items-end'>
            <SelectInput
              id={props.id + 'Year'}
              options={nendoYears}
              error={props.error != null && props.error != ''}
              is_number={true}
              onChange={onChangeYearMonth}
            />
            <span className='pl-1 text-xl font-bold text-text'>年</span>
          </div>

          <div className='box-border flex basis-[25%] items-end'>
            <SelectInput
              id={props.id + 'Month'}
              options={['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
              error={props.error != null && props.error != ''}
              is_number={true}
              onChange={onChangeYearMonth}
            />
            <span className='pl-1 text-xl font-bold text-text'>月</span>
          </div>

          <div className='box-border flex basis-[25%] items-end'>
            <SelectInput
              id={props.id + 'Day'}
              options={days}
              error={props.error != null && props.error != ''}
              is_number={true}
              onChange={onChangeValue}
            />
            <span className='pl-1 text-xl font-bold text-text'>日</span>
          </div>
        </div>

        <div className='flex'>
          <div className='box-border flex basis-[30%] items-end'>
            <SelectInput
              id={props.id + 'Start'}
              options={getTimeList()}
              error={props.error != null && props.error != ''}
              is_number={true}
              onChange={onChangeValue}
            />
          </div>
          <div className='flex basis-[10%] items-center justify-center text-xl font-bold text-text'>
            ～
          </div>
          <div className='box-border flex basis-[30%] items-end'>
            <SelectInput
              id={props.id + 'End'}
              options={getTimeList()}
              error={props.error != null && props.error != ''}
              is_number={true}
              onChange={onChangeValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTimeInput;
