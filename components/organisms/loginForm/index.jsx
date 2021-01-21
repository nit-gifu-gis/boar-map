import "./loginForm.scss";
import Router from "next/router";
import RoundButton from "../../atomos/roundButton";
import TextInput from "../../atomos/textInput";
import "../../../public/static/css/global.scss";
import "../../../utils/statics";
import React from "react";
import { getVersionInfomation } from "../../../utils/versioninfo";
import { SERVER_URI } from "../../../utils/gis";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogining: false,
      isError: false,
      versionNum: ""
    };
    this.onSubmitting.bind(this);
  }

  async componentDidMount() {
    // バージョン情報を取得する
    try {
      const version = await getVersionInfomation();
      this.setState({ versionNum: version.latestNumber });
    } catch (e) {
      console.error("Login: get version error:", e);
    }
  }

  onSubmitting = async event => {
    event.preventDefault();
    // ボタン無効化
    this.setState({
      isLogining: true
    });
    const id = document.getElementById("login__id").value;
    const pass = document.getElementById("login__pass").value;

    const body = {
      userId: id,
      password: pass
    };

    try {
      const res = await fetch(SERVER_URI + "/Authorization/GetToken.php", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (res.status === 200) {
        // ログイン成功時
        const json = await res.json();
        // cookieに記載
        const time = new Date().getTime();
        document.cookie = `user_id=${json.userId}; path=/`;
        document.cookie = `access_token=${json.accessToken}; path=/`;
        document.cookie = `login_time=${time}; path=/`;
        document.cookie =
          "last_lat=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "last_lng=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie =
          "last_zoom=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        // mapへジャンプ
        Router.push("/map");
      } else {
        const json = await res.json();
        console.log(json);
        document.getElementsByClassName("login_error")[0].innerHTML =
          json["reason"];
        this.setState({
          isLogining: false,
          isError: true
        });
      }
    } catch (error) {
      console.log(error);
      document.getElementsByClassName("login_error")[0].innerHTML = error;
      this.setState({
        isLogining: false,
        isError: true
      });
    }
  };

  render() {
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
        <div className="version_num">{this.state.versionNum}</div>
        <div className="form">
          <form
            method="POST"
            onSubmit={this.onSubmitting}
            className="login__form"
          >
            <div className="text_input_area">
              <TextInput
                type="text"
                id="login__id"
                placeholder="ユーザーID"
                required={true}
                error={this.state.isError}
              />
            </div>
            <div className="text_input_area">
              <TextInput
                type="password"
                id="login__pass"
                placeholder="パスワード"
                required={true}
                error={this.state.isError}
              />
            </div>
            <div className="login_error"></div>
            <div className="login_button">
              {this.state.isLogining ? (
                <RoundButton
                  color="primary"
                  ref={this.buttonRef}
                  enabled={false}
                >
                  ログイン中・・・
                </RoundButton>
              ) : (
                <RoundButton color="primary" ref={this.buttonRef}>
                  ログイン
                </RoundButton>
              )}
            </div>
          </form>
        </div>
        <div className="copy_right">
          <span>(c) 2019 National Institute of Technology, </span>
          <span>Gifu College GIS Team</span>
        </div>
      </div>
    );
  }
}

export default LoginForm;
