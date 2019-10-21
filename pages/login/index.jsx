import React from "react";
import Head from "next/head";
import Router from "next/router";
import SessionManager from "../../utils/session";

import Login from "../../components/templates/Login";

class LoginPage extends React.Component {
  componentDidMount() {
    if (SessionManager.isLogin(localStorage)) {
      Router.push("/");
    }
  }

  render() {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>いのししマップぎふ - ログイン</title>
        </Head>
        <Login />
      </>
    );
  }
}

export default LoginPage;
