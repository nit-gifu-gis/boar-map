import React from 'react';
import './infoTitle.scss';

class InfoTitle extends React.Component {
  render() {
    return (
      <div className="info-title">
        <div className="text">{this.props.children}</div>
      </div>
    );
  }
}

export default InfoTitle;
