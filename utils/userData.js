export default class UserData {
  static getUserData() {
    if (process.browser) {
      // ユーザーデータ取得(cookieから持ってくる)
      const userData = { user_id: "", access_token: "", department: "" };
      const r = document.cookie.split(";");
      r.forEach(function(value) {
        const content = value.split("=");
        content[0] = content[0].replace(" ", "");
        if (content[0] == "user_id") {
          userData.user_id = content[1];
        } else if (content[0] == "access_token") {
          userData.access_token = content[1];
        }
      });
      // 本番：ユーザーIDの１文字目からユーザーを識別
      // const userDepartment = userId.substr(0, 1).toUpperCase();
      // テスト環境：ユーザーIDから識別
      // どうして仕様に則ったユーザーIDじゃないの…
      switch (userData.user_id) {
        case "tyousa":
          userData.department = "T";
          break;
        case "yuugai":
          userData.department = "U";
          break;
        case "shityouson":
          userData.department = "S";
          break;
        case "trap":
          userData.department = "W";
          break;
        case "pref":
          userData.department = "K";
          break;
        case "demoino":
          userData.department = null;
          break;
        default:
          userData.department = userId.substr(0, 1).toUpperCase();
          break;
      }
      return userData;
    } else {
      return null;
    }
  }
}
