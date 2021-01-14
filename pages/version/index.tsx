import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../utils/session';

import Version from '../../components/templates/Version';

const VersionPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - バージョン情報</title>
      </Head>
      <Version />
    </>
  );
};

VersionPage.getInitialProps = async ctx => {
  if (!SessionManager.isLogin(ctx)) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: '/login',
      });
      ctx.res.end();
    } else {
      Router.push('/login');
    }
  }
  return { isLogin: true };
};

export default VersionPage;
