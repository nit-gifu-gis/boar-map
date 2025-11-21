import Header from '@/components/organisms/header';
import VersionInfo from '@/components/organisms/versionInfo';
import { VersionInfoProps } from '@/components/organisms/versionInfo/interface';

const VersionTemplate: React.FunctionComponent<VersionInfoProps> = ({ version }) => {
  return (
    <div>
      <Header>バージョン情報</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background pt-2'>
        <VersionInfo version={version} />
        <div className='mb-8'></div>
      </div>
    </div>
  );
};

export default VersionTemplate;
