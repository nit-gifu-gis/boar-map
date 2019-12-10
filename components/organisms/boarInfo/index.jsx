import "./boarInfo.scss";
import React from "react";

class BoarInfo extends React.Component {
  render() {
    console.log(this.props.detail);
    return (
      <>
        <h1>Boar: {this.props.id}</h1>
      </>
    );
  }
}

export default BoarInfo;
