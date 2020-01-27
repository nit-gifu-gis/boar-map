import "./menuSelector.scss";
import Router from "next/router";
import SessionManager from "../../../utils/session";
import React from "react";
import Link from "next/link";

class MenuSelector extends React.Component {
  constructor() {
    super();
  }

  onLogout() {
    const result = window.confirm("本当にログアウトしてよろしいですか？");
    if (result) {
      SessionManager.logout(document);
    }
  }

  render() {
    return (
      <div className="menu_selector">
        <div className="__Title">
          <h1>メニュー</h1>
        </div>
        <div className="__List">
          <p>
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLScPKvUYooxHltgI7oqwTEjURQJBft8Y1vd_ervmfmNg4NDdGA/viewform?usp=sf_link">
              <a>アンケート</a>
            </Link>
          </p>
          <p>
            <Link href="#">
              <a className="logout_link" onClick={this.onLogout}>
                ログアウト
              </a>
            </Link>
          </p>
          <p>
            <Link href="../map">
              <a>マップへ戻る</a>
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

export default MenuSelector;
