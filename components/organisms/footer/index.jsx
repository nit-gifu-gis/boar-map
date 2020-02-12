import "./footer.scss";
import React from "react";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";

class Footer extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="footer__text">{this.props.children}</div>
      </div>
    );
  }
}

export default Footer;
