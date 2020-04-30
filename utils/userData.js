export default class UserData {
  static getUserData() {
    if (process.browser) {
      // ユーザーデータ取得(cookieから持ってくる)
      const userData = { user_id: "", access_token: "" };
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
      return userData;
    } else {
      return null;
    }
  }

  static getUserDepartment() {
    const userData = UserData.getUserData();
    const userId = userData.user_id;

    // 本番：ユーザーIDの１文字目からユーザーを識別
    // const userDepartment = userId.substr(0, 1).toUpperCase();
    // テスト環境：ユーザーIDから識別
    // どうして仕様に則ったユーザーIDじゃないの…
    let userDepartment;
    switch (userId) {
      case "tyousa":
        userDepartment = "T";
        break;
      case "yuugai":
        userDepartment = "U";
        break;
      case "shityouson":
        userDepartment = "S";
        break;
      case "trap":
        userDepartment = "W";
        break;
      case "pref":
        userDepartment = "K";
        break;
      case "demoino":
        userDepartment = null;
        break;
      default:
        userDepartment = userId.substr(0, 1).toUpperCase();
        break;
    }
    return userDepartment;
  }
}
