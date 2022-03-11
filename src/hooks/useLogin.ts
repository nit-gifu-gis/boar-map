import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCurrentUser } from './useCurrentUser';

// ログイン状態でしかアクセスd系内ページはこれを呼び出す
export const useRequireLogin = () => {
  const { isAuthChecking, currentUser } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthChecking) return; // ログイン状態確認中
    if (!currentUser) router.push('/login'); // 未ログインだったのでログインページにリダイレクト
  }, [isAuthChecking, currentUser]);
};

// ログインした状態でアクセスできないページではこれを呼び出す (ログイン画面)
export const useRequireNotLogin = () => {
  const { isAuthChecking, currentUser } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthChecking) return; // ログイン状態確認中
    if (currentUser != null) router.push('/map'); // ログイン中だったのでマップページにリダイレクト
  }, [isAuthChecking, currentUser]);
};
