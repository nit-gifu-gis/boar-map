import "./loginForm.scss";
import Router from "next/router";
import LoginLogo from "../../molecules/loginLogo";
import RoundButton from "../../atomos/roundButton";
import TextInput from "../../atomos/textInput";
import "../../../utils/global.scss";

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
    document.getElementsByClassName("login_error")[0].innerHTML =
      data.commonHeader.systemErrorReport;
  }
};

const LoginForm = () => {
  return (
    <div className="login">
      <div className="image_area">
        <img
          className="image"
          src="static/images/login_image.png"
          alt="いのししマップぎふ"
        ></img>
      </div>
      <div className="title">
        <span>いのしし</span>
        <span>マップ</span>
        <span>ぎふ</span>
      </div>
      <div className="sub_title">
        <span>岐阜県家畜対策公式Webアプリ</span>
      </div>
      <div className="form">
        <form method="POST" onSubmit={OnSubmitting} className="login__form">
          <div className="text_input_area">
            <TextInput
              type="text"
              id="login__id"
              placeholder="ユーザーID"
              required={true}
            />
          </div>
          <div className="text_input_area">
            <TextInput
              type="password"
              id="login__pass"
              placeholder="パスワード"
              required={true}
            />
          </div>
          <div className="login_error"></div>
          <div className="login_button">
            <RoundButton color="primary">ログイン</RoundButton>
          </div>
        </form>
      </div>
      <div className="copy_right">
        <span>(c) 2019 National Institute of Technology, </span>
        <span>Gifu College GIS Team</span>
      </div>
    </div>
  );
};
export default LoginForm;
