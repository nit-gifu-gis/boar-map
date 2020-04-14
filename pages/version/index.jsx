import React from "react";
import Head from "next/head";
import Router from "next/router";
import SessionManager from "../../utils/session";

import Version from "../../components/templates/Version";

class VersionPage extends React.Component {
  static async getInitialProps(ctx) {
    if (!SessionManager.isLogin(ctx)) {
      if (ctx.res) {
        ctx.res.writeHead(302, {
          Location: "/login"
        });
        ctx.res.end();
      } else {
        Router.push("/login");
      }
    }
    return { isLogin: true };
  }

  render() {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>いのししマップぎふ - バージョン情報</title>
        </Head>
        <Version />
      </>
    );
  }
}

export default VersionPage;
