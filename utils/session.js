export default class SessionManager {
  static isLogin(localStorage) {
    const data = {
      access_token: localStorage.getItem("access_token"),
      login_time: localStorage.getItem("login_time"),
      user_id: localStorage.getItem("user_id")
    };

    const now = new Date().getTime();
    const elapsed = now - data.login_time;
    if (data.login_time != null && data.access_token != null) {
      if (elapsed <= 6 * 60 * 60 * 1000) {
        console.log("access token", data.access_token);
        console.log("経過時間", elapsed / 1000);
        return true;
      } else {
        localStorage.removeItem("login_time");
        localStorage.removeItem("access_token");
      }
    }
    return false;
  }
}
