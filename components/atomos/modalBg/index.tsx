// モーダルの背景
// 入力を防ぐ

import React from 'react';
import "./modalBg.scss";

class ModalBg extends React.Component {
  render() {
    return (
      <div className="modal-bg">
        {this.props.children}
      </div>
    )
  }
}

export default ModalBg;