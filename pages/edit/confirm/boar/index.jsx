import React from "react";
import Head from "next/head";
import Router from "next/router";
import SessionManager from "../../../../utils/session";
import EditConfirmBoar from "../../../../components/templates/EditConfirmBoar";

class ConfirmBoarPage extends React.Component {
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
          <link rel="stylesheet" href="/static/css/leaflet.css" />
          <title>いのししマップぎふ - 情報確認</title>
        </Head>
        <EditConfirmBoar />
      </>
    );
  }
}

export default ConfirmBoarPage;
