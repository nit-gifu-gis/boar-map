import Router from "next/router";
import cookies from "next-cookies";
import "./statics";
import { SERVER_URI } from "./gis";

export default class SessionManager {
  static isLogin(ctx) {
    const accessToken = cookies(ctx).access_token;
    const loginTime = parseInt(cookies(ctx).login_time, 10);

    const now = new Date().getTime();
    const elapsed = now - loginTime;
    if (loginTime != null && accessToken != null) {
      if (elapsed <= 6 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  }

  static async logout(document) {
    try {
      const res = await fetch(`${SERVER_URI}/Authorization/DeleteToken.php`, {
        mode: "cors",
        credentials: "include"
      });
      if (res.status === 200) {
        const json = await res.json();
        console.log(json["status"]);
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        Router.push("/login");
      } else {
        const json = await res.json();
        alert(json["reason"]);
      }
    } catch (error) {
      alert(error);
    }
  }
}
