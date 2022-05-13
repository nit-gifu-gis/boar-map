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

const YesNoModal: React.FunctionComponent<Props> = (props) => {
  const [, setShow] = useState(true);
  const onYesClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    resolve(true);
    cleanup();
  };

  const onNoClicked = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    resolve(false);
    cleanup();
  };

  return (
    <ModalBg>
      <ModalWindw>
        <div className='whitespace-pre-wrap'>{props.message}</div>
        <div className='mt-4 flex justify-around'>
          <div className='w-2/5'>
            <RoundButton color='accent' onClick={onNoClicked.bind(this)}>
              <div className='text-base'>いいえ</div>
            </RoundButton>
          </div>
          <div className='w-2/5'>
            <RoundButton color='primary' onClick={onYesClicked.bind(this)}>
              <div className='text-base'>はい</div>
            </RoundButton>
          </div>
        </div>
      </ModalWindw>
    </ModalBg>
  );
};

export default YesNoModal;
