import { NextPage } from 'next';
import { useRequireNotLogin } from '../hooks/useLogin';

const LoginPage: NextPage = () => {
  useRequireNotLogin();

  return (
    <>
      <h1>Login</h1>
    </>
  );
};

export default LoginPage;