import "./version.scss";

import React from "react";
import Router from "next/router";
import Header from "../../organisms/header";
import VersionInfo from "../../../components/organisms/versionInfo";

class SelectType extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="select-type">
        <Header color="primary">バージョン情報</Header>
        <div className="page-contents">
          <VersionInfo />
        </div>
      </div>
    );
  }
}

export default SelectType;
