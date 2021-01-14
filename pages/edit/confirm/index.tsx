import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../../utils/session';
import ConfirmEditedInfo from '../../../components/templates/ConfirmEditedInfo';

const ConfirmEditedInfoPage: NextPage = () => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/static/css/leaflet.css" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
        />
        <title>いのししマップぎふ - 詳細情報編集</title>
      </Head>
      <ConfirmEditedInfo />
    </>
  );
};

ConfirmEditedInfoPage.getInitialProps = ctx => {
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

export default ConfirmEditedInfoPage;
