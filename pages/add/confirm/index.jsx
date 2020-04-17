import React from "react";
import Head from "next/head";
import Router from "next/router";
import SessionManager from "../../../utils/session";
import ConfirmInfo from "../../../components/templates/ConfirmInfo";

class ConfirmInfoPage extends React.Component {
  static async getInitialProps(ctx) {
    if (!SessionManager.isLogin(ctx)) {
      if (ctx.res) {
        ctx.res.writeHead(302, {
          Location: "/login",
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
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="static/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="static/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="static/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="static/favicon/site.webmanifest" />
          <link
            rel="mask-icon"
            href="static/favicon/safari-pinned-tab.svg"
            color="#ff9800"
          />
          <link rel="shortcut icon" href="static/favicon/favicon.ico" />
          <meta name="msapplication-TileColor" content="#ff9800" />
          <meta
            name="msapplication-config"
            content="static/favicon/browserconfig.xml"
          />
          <meta name="theme-color" content="#ffffff"></meta>
          <title>いのししマップぎふ - 詳細情報登録</title>
        </Head>
        <ConfirmInfo />
      </>
    );
  }
}

export default ConfirmInfoPage;
