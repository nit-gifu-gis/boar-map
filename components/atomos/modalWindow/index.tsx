// モーダルのウィンドウ

import React from 'react';
import "./modalWindow.scss";

type Props = {

};

type State = {

};

class ModalWindow extends React.Component<Props, State> {
  render() {
    return (
      <div className="modal-window">
        {
          this.props.children
        }
      </div>
    )
  }
}

export default ModalWindow;