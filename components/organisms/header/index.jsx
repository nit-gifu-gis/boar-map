import "./header.scss";
import React from "react";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";
import Link from "next/link";
import SessionManager from "../../../utils/session";

class Header extends React.Component {
  onClickHam() {
    const ham = document.getElementById("ham");
    const header = document.getElementById("header");
    ham.classList.toggle("clicked");
    header.classList.toggle("clicked");
  }

  onLogout() {
    const result = window.confirm("本当にログアウトしてよろしいですか？");
    if (result) {
      SessionManager.logout(document);
    }
  }

  render() {
    const bgColor = getColorCode(this.props.color);
    // フォントサイズ決定（要修正）
    const textLength = this.props.children.length;
    let textFontSize = 30;
    if (textLength >= 8) {
      textFontSize = 25;
    }
    return (
      <div className="header" id="header" style={{ backgroundColor: bgColor }}>
        <div className="title">
          <div className="text" style={{ fontSize: textFontSize }}>
            {this.props.children}
          </div>
          <div
            className="hamburger_button"
            id="ham"
            style={{ backgroundColor: bgColor }}
            onClick={this.onClickHam.bind(this)}
          >
            <span className="ham_line ham_line1"></span>
            <span className="ham_line ham_line2"></span>
            <span className="ham_line ham_line3"></span>
          </div>
        </div>
        <div className="menu">
          <div className="menu_item">
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLScPKvUYooxHltgI7oqwTEjURQJBft8Y1vd_ervmfmNg4NDdGA/viewform?usp=sf_link">
              <a target="_blank">アンケート</a>
            </Link>
          </div>
          <div className="menu_item">
            <Link href="#">
              <a>バージョン情報</a>
            </Link>
          </div>
          <div className="menu_item danger_item">
            <Link href="#">
              <a className="logout_link" onClick={this.onLogout}>
                ログアウト
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
