import React from "react";
import Head from "next/head";
import Router from "next/router";

import Index from "../components/templates/Index";
import SessionManager from "../utils/session";

class IndexPage extends React.Component {
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
          <title>いのししマップぎふ - トップ</title>
        </Head>
        <Index />
      </>
    );
  }
}

export default IndexPage;
