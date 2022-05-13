// 選択肢がOKしか無いアラートのモーダル

import React, { useState } from 'react';
import ModalBg from '../../atomos/modalBg';
import ModalWindw from '../../atomos/modalWindow';
import RoundButton from '../../atomos/roundButton';

type Props = {
  message: string;
  resolve: (res: boolean) => void;
  cleanup: () => void;
};

const AlertModal: React.FunctionComponent<Props> = (props) => {
  const [, setShow] = useState(true);
  const onOkClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    resolve(true);
    cleanup();
  };

  return (
    <ModalBg>
      <ModalWindw>
        <div className='whitespace-pre-wrap'>{props.message}</div>
        <div className='mt-4 flex justify-around'>
          <div className='w-2/5'>
            <RoundButton color='primary' onClick={onOkClicked.bind(this)}>
              <div className='text-base'>OK</div>
            </RoundButton>
          </div>
        </div>
      </ModalWindw>
    </ModalBg>
  );
};

export default AlertModal;
