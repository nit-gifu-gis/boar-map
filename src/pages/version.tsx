import { GetStaticProps, NextPage } from 'next';
import { VersionInfoProps } from '../components/organisms/versionInfo/interface';
import VersionTemplate from '../components/templates/versionTemplate';
import { useRequireLogin } from '../hooks/useLogin';
import { getVersionInfo } from '../utils/version';

const VersionPage: NextPage<VersionInfoProps> = ({ version }) => {
  useRequireLogin();
  return (
    <>
      <VersionTemplate version={version} />
    </>
  );
};

export default VersionPage;

// バージョン情報はビルド時に取得
export const getStaticProps: GetStaticProps = async () => {
  return { props: { version: getVersionInfo() } };
};
