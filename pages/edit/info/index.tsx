import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SessionManager from '../../../utils/session';
import EditInfo from '../../../components/templates/EditInfo';

const EditInfoPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - 詳細情報編集</title>
      </Head>
      <EditInfo />
    </>
  );
};

EditInfoPage.getInitialProps = ctx => {
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

export default EditInfoPage;
