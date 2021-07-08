import React from "react";
import Head from "next/head";
import Router from "next/router";
import SessionManager from "../../utils/session";
import List from "../../components/templates/List";

class ListPage extends React.Component {
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
          <title>いのししマップぎふ - 一覧表</title>
        </Head>
        <List></List>
      </>
    );
  }
}

export default ListPage;
