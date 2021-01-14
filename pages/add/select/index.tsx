import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import SelectType from '../../../components/templates/SelectType';
import SessionManager from '../../../utils/session';

const SelectPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>いのししマップぎふ - 新規情報登録</title>
      </Head>
      <SelectType />
    </>
  );
};

SelectPage.getInitialProps = ctx => {
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

export default SelectPage;
