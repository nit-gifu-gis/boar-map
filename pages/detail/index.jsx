import React from "react";
import Head from "next/head";
import Router from "next/router";
import Detail from "../../components/templates/Detail";
import SessionManager from "../../utils/session";

class DetailPage extends React.Component {
  componentDidMount() {
    if (!SessionManager.isLogin(localStorage)) {
      Router.push("/login");
    }
  }

  render() {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>いのししマップぎふ - スポット詳細</title>
        </Head>
        <Detail />
      </>
    );
  }
}

export default DetailPage;
