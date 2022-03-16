// モーダルの背景
// 入力を防ぐ

import React from 'react';

const ModalBg: React.FunctionComponent = (props) => {
  return (
    <div className='modal-bg fixed top-0 left-0 right-0 bottom-0 z-50 m-auto flex items-center justify-center'>
      {props.children}
    </div>
  );
};

export default ModalBg;
