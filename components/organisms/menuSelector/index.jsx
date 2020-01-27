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
      <div className="menuSelector">
        <ul>
          <li>
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLScPKvUYooxHltgI7oqwTEjURQJBft8Y1vd_ervmfmNg4NDdGA/viewform?usp=sf_link">
              <a>アンケート</a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a className="logout_link" onClick={this.onLogout}>
                ログアウト
              </a>
            </Link>
          </li>
          <li>
            <Link href="../map">
              <a>マップへ戻る</a>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default MenuSelector;
