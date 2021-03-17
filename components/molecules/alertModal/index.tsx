// 選択肢がOKしか無いアラートのモーダル

import React from 'react';
import ModalBg from '../../atomos/modalBg';
import ModalWindw from '../../atomos/modalWindow';
import RoundButton from '../../atomos/roundButton';

import "./alertModal.scss";

type Props = {
  message: string;
  resolve: (res: Boolean) => void;
  cleanup: () => void;
};

type State = {
  show: boolean;
};

class AlertModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      show: true
    };
  }

  onClickCancel() {
    const { resolve, cleanup } = this.props;
    this.setState({ show: false }, () => {
      resolve(false);
      cleanup();
    });
  };

  onClickOk() {
    const { resolve, cleanup } = this.props;
    this.setState({ show: false }, () => {
      resolve(true);
      cleanup();
    });
  };

  render() {
    const { show } = this.state;

    return (
      <ModalBg>
        <ModalWindw>
          <div className="modal-body">
            {this.props.message}
          </div>
          <div className="modal-footer">
            <div className="button-wrapper">
              <RoundButton color="primary" bind={this.onClickOk.bind(this)}>
                <div className="button-text">
                  OK
              </div>
              </RoundButton>
            </div>
          </div>
        </ModalWindw>
      </ModalBg>
    )
  }
}


export default AlertModal;