import '../styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useSetRecoilState, RecoilRoot } from 'recoil';
import { currentUserState } from '../states/currentUser';
import { fetchCurrentUser } from '../utils/currentUser';
import { useCurrentUser } from '../hooks/useCurrentUser';
import LoadingTemplate from '../components/templates/loadingTemplate';
import Head from 'next/head';

const AppInit: React.FunctionComponent = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);

  useEffect(() => {
    (async function () {
      try {
        const currentUser = await fetchCurrentUser();
        setCurrentUser(currentUser);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);

  return null;
};

const ContentSwitcher: React.FunctionComponent = (props) => {
  const { isAuthChecking } = useCurrentUser();
  return isAuthChecking ? <LoadingTemplate /> : <>{props.children}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <RecoilRoot>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="static/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="static/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="static/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="static/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="static/favicon/safari-pinned-tab.svg"
          color="#ff9800"
        />
        <link rel="shortcut icon" href="static/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ff9800" />
        <meta
          name="msapplication-config"
          content="static/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#ffffff"></meta>
        <meta property="og:url" content="https://boar-map.gifugis.jp/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="いのししマップぎふ" />
        <meta property="og:description" content="岐阜県家畜対策公式Webアプリです。このアプリケーションは岐阜高専GIS開発部が開発しています。" />
        <meta property="og:site_name" content="いのししマップぎふ" />
        <meta property="og:image" content="https://boar-map.gifugis.jp/static/favicon/ogp.png" />
        <link rel="canonical" href="https://boar-map.gifugis.jp/"></link>
        <title>いのししマップぎふ</title>
      </Head>
      <ContentSwitcher>
        <Component {...pageProps} />
      </ContentSwitcher>
      <AppInit />
    </RecoilRoot>
  );
};

export default App;
