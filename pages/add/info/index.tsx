import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../../utils/session';
import AddInfo from '../../../components/templates/AddInfo';

const AddInfoPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - 詳細情報登録</title>
      </Head>
      <AddInfo />
    </>
  );
};

AddInfoPage.getInitialProps = ctx => {
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

export default AddInfoPage;
