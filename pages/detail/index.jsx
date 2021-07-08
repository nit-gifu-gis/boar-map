import React from "react";
import Head from "next/head";
import Router from "next/router";
import Detail from "../../components/templates/Detail";
import SessionManager from "../../utils/session";

class DetailPage extends React.Component {
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
          <link rel="stylesheet" href="/static/css/leaflet.css" />
          <title>いのししマップぎふ - スポット詳細</title>
        </Head>
        <Detail />
      </>
    );
  }
}

export default DetailPage;
