import "./login.scss";
import Router from "next/router";

import Header from "../../organisms/header";
import Footer from "../../organisms/footer";

const OnSubmitting = event => {
  event.preventDefault();
  const id = document.getElementById("login-id").value;
  const pass = document.getElementById("login-pass").value;
  const receiptNumber = Math.floor(Math.random() * 100000);
  const data = {
    commonHeader: {
      receiptNumber: receiptNumber
    },
    userID: id,
    password: pass,
    tenantID: "210005"
  };

  const url =
    "https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/GetToken";
  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(function(res) {
      const time = new Date().getTime();
      const json = res.json().then(data => onLogin(data, time));
    })
    .catch(error => console.log("Error: " + error));
};

const onLogin = (data, time) => {
  console.log(data);
  console.log(data["commonHeader"].resultInfomation);
  if (data["commonHeader"].resultInfomation == "0") {
    localStorage.setItem("user_id", data.data.user_Id);
    localStorage.setItem("access_token", data.data.accessToken);
    localStorage.setItem("login_time", time);
    Router.push("/");
  } else {
    document.getElementById("error_message").innerHTML =
      data.commonHeader.systemErrorReport;
  }
};

const Login = () => (
  <div>
    <Header />
    <form method="POST" onSubmit={OnSubmitting}>
      <h1>ユーザーID</h1>
      <input type="text" id="login-id" required />
      <h1>パスワード</h1>
      <input type="password" id="login-pass" required />
      <button>ログイン</button>
    </form>
    <h2 id="error_message"></h2>
    <Footer />
  </div>
);

export default Login;
