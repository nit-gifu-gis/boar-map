import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { currentUserState } from '../../../states/currentUser';
import { fetchCurrentUser } from '../../../utils/currentUser';
import { SERVER_URI } from '../../../utils/constants';
import RoundButton from '../../atomos/roundButton';
import TextInput from '../../atomos/TextInput';
import { setCookie } from 'nookies';

const LoginForm: React.FunctionComponent = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

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
