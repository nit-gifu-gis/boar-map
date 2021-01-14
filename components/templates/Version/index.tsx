import './version.scss';

import React from 'react';
import Header from '../../organisms/header';
import VersionInfo from '../../organisms/versionInfo';

const Version: React.FunctionComponent = () => {
  return (
    <div className="select-type">
      <Header color="primary">バージョン情報</Header>
      <div className="page-contents">
        <VersionInfo />
      </div>
    </div>
  );
};

export default Version;
