// 選択肢がOKしか無いアラートのモーダル

import React, { useState } from 'react';
import { CityInfo } from '../../../types/features';
import ModalBg from '../../atomos/modalBg';
import ModalWindw from '../../atomos/modalWindow';
import RoundButton from '../../atomos/roundButton';
import SelectInput from '../../atomos/selectInput';

type Props = {
  list: CityInfo[];
  resolve: (info: CityInfo | null) => void;
  cleanup: () => void;
};

const CitySelectModal: React.FunctionComponent<Props> = (props) => {
  const [, setShow] = useState(true);
  const onOKClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    const city_select = document.getElementById('city-select') as HTMLSelectElement;
    if (city_select == null) {
      resolve(null);
      cleanup();
      return;
    }
    resolve(props.list[city_select.selectedIndex]);
    cleanup();
  };

  const onCancelClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    resolve(null);
    cleanup();
  };

  return (
    <ModalBg>
      <ModalWindw>
        <div className='whitespace-pre-wrap'>
          複数の情報が見つかりました。
          <br />
          移動したい地点を選択してください。
        </div>
        <SelectInput
          options={props.list.map(
            (v) =>
              `${v.name} (${Math.floor(v.point.lat * 100000) / 100000},${
                Math.floor(v.point.lng * 100000) / 100000
              })`,
          )}
          id='city-select'
          error={false}
        />
        <div className='mt-4 flex justify-around'>
          <div className='w-2/5'>
            <RoundButton color='accent' onClick={onCancelClicked.bind(this)}>
              <div className='text-base'>キャンセル</div>
            </RoundButton>
          </div>
          <div className='w-2/5'>
            <RoundButton color='primary' onClick={onOKClicked.bind(this)}>
              <div className='text-base'>OK</div>
            </RoundButton>
          </div>
        </div>
      </ModalWindw>
    </ModalBg>
  );
};

export default CitySelectModal;
