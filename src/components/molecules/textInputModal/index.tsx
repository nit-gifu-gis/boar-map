// 選択肢がOKしか無いアラートのモーダル

import React, { useState } from 'react';
import ModalBg from '../../atomos/modalBg';
import ModalWindw from '../../atomos/modalWindow';
import RoundButton from '../../atomos/roundButton';
import InfoInput from '../infoInput';

type Props = {
  message: string;
  input_title: string;
  resolve: (input: string | null) => void;
  cleanup: () => void;
};

const TextInputModal: React.FunctionComponent<Props> = (props) => {
  const [, setShow] = useState(true);
  const onOKClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    const city_select = document.getElementById('modalinput_text') as HTMLSelectElement;
    if (city_select == null) {
      resolve(null);
      cleanup();
      return;
    }
    resolve(city_select.value as string);
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
          {props.message}
        </div>
        <div className='pt-5 whitespace-pre-wrap'>
          {props.input_title}
        </div>
        <InfoInput
          title={""}
          type='textarea'
          rows={3}
          id='modalinput_text'
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

export default TextInputModal;
