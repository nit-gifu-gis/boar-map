import "./loginForm.scss";
import Router from "next/router";
import LoginLogo from "../../molecules/loginLogo";

const OnSubmitting = event => {
  event.preventDefault();
  const id = document.getElementById("login__id").value;
  const pass = document.getElementById("login__pass").value;
  const receiptNumber = Math.floor(Math.random() * 100000);
  const data = {
    commonHeader: {
      receiptNumber: receiptNumber
    },
    userID: id,
    password: pass,
    tenantID: "21000S"
  };

  fetch("/api/JsonService.asmx/GetToken", {
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
    document.cookie = `user_id=${data.data.userId}; path=/`;
    document.cookie = `access_token=${data.data.accessToken}; path=/`;
    document.cookie = `login_time=${time}; path=/`;
    Router.push("/");
  } else {
    document.getElementById("login__error").innerHTML =
      data.commonHeader.systemErrorReport;
  }
};

const LoginForm = () => {
  return (
    <div className="login">
      <img
        src="images/logosample.png"
        alt=""
        width=""
        height="80px"
        border="0"
        className="title"
      />
      <h1 className="title">ログイン</h1>
      <div className="form">
        <form method="POST" onSubmit={OnSubmitting} className="login__form">
          <h1>ユーザーID</h1>
          <div className="input_form">
            <input type="text" id="login__id" required />
          </div>
          <h1>パスワード</h1>
          <div className="input_form">
            <input type="password" id="login__pass" required />
          </div>
          <div className="input_form">
            <button>ログイン</button>
          </div>
        </form>
        <h2 id="login__error"></h2>
      </div>
    </div>
  );
};
export default LoginForm;
