import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../utils/session';

import Login from '../../components/templates/Login';

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - ログイン</title>
      </Head>
      <Login />
    </>
  );
};

LoginPage.getInitialProps = ctx => {
  if (SessionManager.isLogin(ctx)) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: '/map',
      });
      ctx.res.end();
    } else {
      Router.push('/map');
    }
  }
  return { isLogin: true };
};

export default LoginPage;
