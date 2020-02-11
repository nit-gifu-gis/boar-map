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
              <a target="_blank">アンケート</a>
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
        <div className="__app_info">
          <p>Version: 0.8.0</p>
          <p>
            Copyright (c) 2019 National Institute of Technology, Gifu College
            GIS Team
          </p>
        </div>
      </div>
    );
  }
}

export default MenuSelector;
