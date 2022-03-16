// モーダルのウィンドウ

import React from 'react';

const ModalWindow: React.FunctionComponent = (props) => {
  return (
    <div className='shadow-10 box-border h-auto w-9/10 max-w-sm bg-background p-4'>
      {props.children}
    </div>
  );
};

export default ModalWindow;
