import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import AddLocation from '../../../components/templates/AddLocation';
import SessionManager from '../../../utils/session';

const AddLocationPage: NextPage = () => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/static/css/leaflet.css" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
        />
        <title>いのししマップぎふ - 位置情報選択</title>
      </Head>
      <AddLocation />
    </>
  );
};

AddLocationPage.getInitialProps = ctx => {
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

export default AddLocationPage;
