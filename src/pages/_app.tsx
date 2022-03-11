import '../styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useSetRecoilState, RecoilRoot } from 'recoil';
import { currentUserState } from '../states/currentUser';
import { fetchCurrentUser } from '../utils/currentUser';
import { useCurrentUser } from '../hooks/useCurrentUser';
import LoadingTemplate from '../components/templates/loadingTemplate';

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
      <ContentSwitcher>
        <Component {...pageProps} />
      </ContentSwitcher>
      <AppInit />
    </RecoilRoot>
  );
};

export default App;
