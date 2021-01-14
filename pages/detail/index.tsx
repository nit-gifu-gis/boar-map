import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import Detail from '../../components/templates/Detail';
import SessionManager from '../../utils/session';

const DetailPage: NextPage = () => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/static/css/leaflet.css" />
        <title>いのししマップぎふ - スポット詳細</title>
      </Head>
      <Detail />
    </>
  );
};

DetailPage.getInitialProps = ctx => {
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

export default DetailPage;
