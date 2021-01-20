import style from "./header.scss";
import "./header.scss";
import React from "react";
import "../../../utils/statics";
import Link from "next/link";
import SessionManager from "../../../utils/session";
import { hasListPermission } from "../../../utils/gis";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false
    };
  }

  onClickHam() {
    const ham = document.getElementById("ham");
    const header = document.getElementById("header");
    ham.classList.toggle("clicked");
    header.classList.toggle("clicked");
    const c = this.state.clicked;
    this.setState({ clicked: !c });
  }

  onLogout() {
    const result = window.confirm("本当にログアウトしてよろしいですか？");
    if (result) {
      SessionManager.logout(document);
    }
  }

  render() {
    // コンテンツ
    const contents = [];

    // マップ画面
    contents.push(
      <div className="menu_item" key="menu_item_map">
        <Link href="/map">
          <a>マップ</a>
        </Link>
      </div>
    );

    // K,R,S権限であれば一覧表
    if (hasListPermission("boar")) {
      contents.push(
        <div className="menu_item" key="menu_item_list">
          <Link href="/list">
            <a>一覧表</a>
          </Link>
        </div>
      );
    }

    // アンケート
    contents.push(
      <div className="menu_item" key="menu_item_questionnaire">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScPKvUYooxHltgI7oqwTEjURQJBft8Y1vd_ervmfmNg4NDdGA/viewform?usp=sf_link"
          target="_blank"
          rel="noopener noreferrer"
        >
          アンケート
        </a>
      </div>
    );

    // バージョン情報
    contents.push(
      <div className="menu_item" key="menu_item_version">
        <Link href="/version">
          <a>バージョン情報</a>
        </Link>
      </div>
    );

    // ログアウト
    contents.push(
      <div className="menu_item danger_item" key="menu_item_logout">
        <Link href="#">
          <a className="logout_link" onClick={this.onLogout}>
            ログアウト
          </a>
        </Link>
      </div>
    );

    // ヘッダー高さ決定
    const itemHeight = parseInt(style.menuItemHeight);
    const headerHeight = parseInt(style.headerHeight);
    const itemLength = contents.length;
    let height = headerHeight;
    if (this.state.clicked) {
      height += (itemHeight + 1) * itemLength;
    }

    // 背景色決定
    const bgColor = getColorCode(this.props.color);

    // フォントサイズ決定（要修正）
    let textFontSize = 30;
    if (typeof this.props.children == "string") {
      const textLength = this.props.children.length;
      if (textLength != null && textLength >= 7) {
        textFontSize = 25;
      }
    }

    // アニメーション
    const anim1 = "all 0.2s ease-in-out";
    const anim2 = "all 0.2s 0.2s ease-in-out";

    return (
      <div
        className="header"
        id="header"
        style={{
          backgroundColor: bgColor,
          height: height,
          transition: this.state.clicked ? anim1 : anim2
        }}
      >
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
        <div
          className="menu"
          style={{
            height: itemHeight * itemLength,
            transition: this.state.clicked ? anim2 : anim1
          }}
        >
          {contents}
        </div>
      </div>
    );
  }
}

export default Header;
