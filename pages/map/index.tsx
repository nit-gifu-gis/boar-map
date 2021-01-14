import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../utils/session';

import Map from '../../components/templates/Map';

const MapPage: NextPage = () => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/static/css/leaflet.css" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
        />
        <title>いのししマップぎふ - マップ</title>
      </Head>
      <Map />
    </>
  );
};

MapPage.getInitialProps = ctx => {
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

export default MapPage;
