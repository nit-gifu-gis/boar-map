import { GetStaticProps, NextPage } from 'next';
import { useRequireNotLogin } from '../hooks/useLogin';
import { getVersionInfo } from '../utils/version';
import { LoginProps } from '../components/templates/loginTemplate/interface';
import LoginTemplate from '../components/templates/loginTemplate';

const LoginPage: NextPage<LoginProps> = ({ version }: LoginProps) => {
  useRequireNotLogin();

  return (
    <>
      <LoginTemplate version={version} />
    </>
  );
};

export default LoginPage;

// バージョン情報はビルド時に取得
export const getStaticProps: GetStaticProps = async () => {
  return { props: { version: getVersionInfo() } };
};
