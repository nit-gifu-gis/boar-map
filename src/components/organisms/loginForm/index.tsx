import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { currentUserState } from '../../../states/currentUser';
import { fetchCurrentUser } from '../../../utils/currentUser';
import { SERVER_URI } from '../../../utils/constants';
import RoundButton from '../../atomos/roundButton';
import TextInput from '../../atomos/TextInput';
import { setCookie } from 'nookies';
import { alert } from '../../../utils/modal';
import * as Sentry from '@sentry/nextjs';

const LoginForm: React.FunctionComponent = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncTask = async () => {
      // 開発用サーバーだった場合には通知を表示する
      /*if (
        document.domain.toLowerCase().endsWith('.prsvr.net') ||
        document.domain.toLocaleLowerCase().endsWith('.gifu-nct.ac.jp')
      ) {
        if (await confirm('このサイトは開発版です。\n安定動作版のサイトへ移動しますか？')) {
          location.href = 'https://boar-map.gifugis.jp/login';
        }
      }*/

      // 開発版サーバーの場合の通知はOKメッセージだけにする。 (2025/1/20暫定対応)
      if (
        document.domain.toLowerCase().endsWith('.prsvr.net') ||
        document.domain.toLocaleLowerCase().endsWith('.gifu-nct.ac.jp')
      ) {
        await alert('このサイトは開発版です。\n安定動作版と異なり、正常に動作しない場合があります。');
      }
    };
    asyncTask();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    const id = (document.getElementById('login_id') as HTMLInputElement).value;
    const pass = (document.getElementById('login_pass') as HTMLInputElement).value;

    const body = {
      user_id: id,
      password: pass,
    };

    try {
      const res = await fetch(SERVER_URI + '/Auth/GetToken', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.status === 200) {
        setIsLoggingIn(false);
        setCookie(null, 'jwt', json.token);
        try {
          const currentUser = await fetchCurrentUser();
          setCurrentUser(currentUser);
          Sentry.setUser({ id: currentUser?.userId, segment: currentUser?.userDepartment });
          router.push('/map');
        } catch {
          setCurrentUser(null);
          setError('ログイン情報の保存に失敗しました。');
        }
      } else {
        setIsLoggingIn(false);
        setError(json.error);
      }
    } catch (error) {
      setIsLoggingIn(false);
      setError(`${error}`);
    }
  };

  return (
    <div className='my-12 w-auto text-center'>
      <form method='POST' onSubmit={onSubmit.bind(this)}>
        <div className='mt-4'>
          <TextInput
            type='text'
            id='login_id'
            placeholder='ユーザーID'
            required={true}
            isError={error != ''}
          />
        </div>
        <div className='mt-4'>
          <TextInput
            type='password'
            id='login_pass'
            placeholder='パスワード'
            required={true}
            isError={error != ''}
          />
        </div>
        <div className='mt-5 text-xl text-danger'>{error}</div>
        <RoundButton color='primary' disabled={isLoggingIn}>
          {isLoggingIn ? 'ログイン中...' : 'ログイン'}
        </RoundButton>
      </form>
    </div>
  );
};

export default LoginForm;
