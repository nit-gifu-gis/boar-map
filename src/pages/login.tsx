import { GetStaticProps, NextPage } from 'next';

import LoginTemplate from '@/components/templates/loginTemplate';
import { LoginProps } from '@/components/templates/loginTemplate/interface';
import { useRequireNotLogin } from '@/hooks/useLogin';
import { getVersionInfo } from '@/utils/version';

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
