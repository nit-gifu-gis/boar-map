import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { VersionInfoProps } from './interface';

const VersionInfo: React.FunctionComponent<VersionInfoProps> = ({ version }) => {
  return (
    <div className='box-border w-full bg-background text-center'>
      <div className='mx-[15px] my-[5px] text-center text-2xl'>{version.latestNumber}</div>
      <div className='mx-[15px] my-[5px] h-[100px] text-center'>
        <Image
          src='/static/images/team_logo.png'
          width={100}
          height={100}
          alt='Logo of National Insitute of Technology, Gifu College, GIS Team'
        />
      </div>
      <div className='mx-[15px] my-[5px] text-center'>
        このアプリケーションは岐阜高専GIS開発部が開発しています。
      </div>
      <div className='mx-[15px] mt-8 mb-1 text-left'>
        <div className='text-xl font-bold'>更新履歴</div>
        <div className='markdown'>
          <ReactMarkdown skipHtml={true}>{version.allText}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default VersionInfo;
