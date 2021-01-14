import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../utils/session';
import List from '../../components/templates/List';

const ListPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - 一覧表</title>
      </Head>
      <List></List>
    </>
  );
};

ListPage.getInitialProps = ctx => {
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

export default ListPage;
