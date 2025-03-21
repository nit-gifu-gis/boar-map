import '../styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useSetRecoilState, RecoilRoot } from 'recoil';
import { currentUserState } from '../states/currentUser';
import { fetchCurrentUser, getAccessToken } from '../utils/currentUser';
import { useCurrentUser } from '../hooks/useCurrentUser';
import LoadingTemplate from '../components/templates/loadingTemplate';
import Head from 'next/head';
import { currentAppLogs } from '../states/appLog';
import * as Sentry from "@sentry/nextjs";
import { butanetsuViewState } from '../states/butanetsuView';
import { SERVER_URI } from '../utils/constants';

const AppInit: React.FunctionComponent = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentAppLog = useSetRecoilState(currentAppLogs);
  const setCurrentButanetsuView = useSetRecoilState(butanetsuViewState);

  let appLogs: AppLog[] = [];

  let origLog = console.log;
  let origWarn = console.warn;
  let origError = console.error;
  let origTrace = console.trace;

  const logHandler = (message?: unknown, ...optionalParams: unknown[]) => {
    origLog(message, ...optionalParams);
    appLogs = appLogs.slice();
    appLogs.push({
      type: "log",
      message: message,
      optionalParams: optionalParams
    });
    setCurrentAppLog(appLogs);
  };

  const warnHandler = (message?: unknown, ...optionalParams: unknown[]) => {
    origWarn(message, ...optionalParams);
    appLogs = appLogs.slice();
    appLogs.push({
      type: "warn",
      message: message,
      optionalParams: optionalParams
    });
    setCurrentAppLog(appLogs);
  };

  const errorHandler = (message?: unknown, ...optionalParams: unknown[]) => {
    origError(message, ...optionalParams);
    appLogs = appLogs.slice();
    appLogs.push({
      type: "error",
      message: message,
      optionalParams: optionalParams
    });
    setCurrentAppLog(appLogs);
  };

  const traceHandler = (message?: unknown, ...optionalParams: unknown[]) => {
    origTrace(message, ...optionalParams);
    appLogs = appLogs.slice();
    appLogs.push({
      type: "trace",
      message: message,
      optionalParams: optionalParams
    });
    setCurrentAppLog(appLogs);
  };

  useEffect(() => {
    (async function () {
      try {
        const currentUser = await fetchCurrentUser();

        // 豚熱確認情報の設定を取得する
        const res = await fetch(SERVER_URI + '/Settings/Butanetsu', {
          headers: {
            'X-Access-Token': getAccessToken(),
          },
        });

        if (res.ok) {
          const json = await res.json();
          setCurrentButanetsuView({
            radius: json['radius'] as number,
            month: json['month'] as number,
            style: 1,
            origin: new Date()
          });
        }

        setCurrentUser(currentUser);
        Sentry.setUser({ id: currentUser?.userId, segment: currentUser?.userDepartment });
      } catch {
        setCurrentUser(null);
      }

      setCurrentAppLog([]);
      if(console.log != null && console.log != logHandler) {
        origLog = console.log;
        console.log = logHandler;
      }
      
      if(console.error != null && console.error != errorHandler) {
        origError = console.error;
        console.error = errorHandler;
      }
      
      if(console.warn != null && console.warn != warnHandler) {
        origWarn = console.warn;
        console.warn = warnHandler;
      }

      if(console.trace != null && console.trace != traceHandler) {
        origTrace = console.trace;
        console.trace = traceHandler;
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
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='apple-touch-icon' sizes='180x180' href='/static/favicon/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/static/favicon/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/static/favicon/favicon-16x16.png' />
        <link rel='manifest' href='/static/favicon/site.webmanifest' />
        <link rel='mask-icon' href='/static/favicon/safari-pinned-tab.svg' color='#ff9800' />
        <link rel='shortcut icon' href='/static/favicon/favicon.ico' />
        <meta name='msapplication-TileColor' content='#ff9800' />
        <meta name='msapplication-config' content='/static/favicon/browserconfig.xml' />
        <meta name='theme-color' content='#ffffff'></meta>
        <meta property='og:url' content='https://boar-map.gifugis.jp/' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='いのししマップぎふ' />
        <meta
          property='og:description'
          content='岐阜県家畜対策公式Webアプリです。このアプリケーションは岐阜高専GIS開発部が開発しています。'
        />
        <meta property='og:site_name' content='いのししマップぎふ' />
        <meta property='og:image' content='https://boar-map.gifugis.jp/static/favicon/ogp.png' />
        <link rel='canonical' href='https://boar-map.gifugis.jp/'></link>
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
