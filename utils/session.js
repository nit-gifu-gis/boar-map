import Router from "next/router";
import cookies from "next-cookies";
import "./statics";

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

  static logout(document) {
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

    const receiptNumber = Math.floor(Math.random() * 100000);
    const data = {
      commonHeader: {
        receiptNumber: receiptNumber
      },
      userID: userData.user_id,
      tenantID: "21000S"
    };
    const header = {
      "X-Map-Api-Access-Token": userData.access_token
    };

    fetch("/api/JsonService.asmx/DeleteToken", {
      method: "POST",
      headers: header,
      body: JSON.stringify(data)
    })
      .then(res =>
        res.json().then(data => {
          console.log(data);
          fetch(IMAGE_SERVER_URI + "/logout.php", {
            credentials: "include"
          })
            .then(res2 =>
              res2.json().then(data2 => {
                if (data2["status"] === 200) {
                  document.cookie =
                    "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                  document.cookie =
                    "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                  document.cookie =
                    "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                  Router.push("/login");
                }
              })
            )
            .catch(error => alert("Error: ", error));
        })
      )
      .catch(error => alert("Error: ", error));
  }
}
