import "./footer.scss";
import React from "react";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";

class Footer extends React.Component {
  render() {
    // childrenに複数個要素を渡すと均等割り付けします
    let children;
    if (Array.isArray(this.props.children)) {
      const len = this.props.children.length;
      const width = "calc(100vw / " + len + ")";
      console.log("width", width);
      children = [];
      this.props.children.forEach(c => {
        const div = (
          <div className="footer__child" style={{ width: width }}>
            {c}
          </div>
        );
        children.push(div);
      });
    } else {
      children = (
        <div className="footer__child" style={{ width: "75vw" }}>
          {this.props.children}
        </div>
      );
    }
    return <div className="footer">{children}</div>;
  }
}

export default Footer;
