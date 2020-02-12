import "./header.scss";
import React from "react";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";

class Header extends React.Component {
  render() {
    return (
      <div
        className="header"
        style={{ backgroundColor: getColorCode(this.props.color) }}
      >
        <div className="header__text">{this.props.children}</div>
      </div>
    );
  }
}

export default Header;
