import Image from 'next/image';
import Link from 'next/link';
import Header from '../../organisms/header';

const IndexTemplate: React.FunctionComponent = () => {
  return (
    <div className='w-screen'>
      <Header>トップページ</Header>
      <div className='mx-auto box-border w-screen max-w-window px-2'>
        <div className='mt-1 w-full text-center'>
          <Image src='/login.png' width={400} height={110} alt='Main Logo' />
        </div>
        <div className='w-auto text-center text-4xl font-bold text-primary'>
          <span className='inline-block'>いのしし</span>
          <span className='inline-block'>マップ</span>
          <span className='inline-block'>ぎふ</span>
        </div>
        <div className='w-auto text-center text-xl text-text'>
          <span className='inline-block'>岐阜県家畜対策公式Webアプリ</span>
        </div>
        <div className='w-auto py-5 text-center text-xl text-text'>
          <span className='inline-block'>どちらか選択してください</span>
        </div>
        <div className='mx-auto flex flex-wrap justify-around pt-5'>
          <div className='shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-trace before:block before:pb-full'>
            <Link href='/trace'>
              <a>
                <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-lg p-1 text-center text-xl'>
                  ジビエ肉の履歴確認
                </div>
              </a>
            </Link>
          </div>
          <div className='shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-map before:block before:pb-full'>
            <Link href='/map'>
              <a>
                <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-lg p-1 text-center text-xl'>
                  マップ
                </div>
              </a>
            </Link>
          </div>
        </div>
        <div className='pt-8 text-center'>
          &copy; 2019-2025 National Institute of Technology, Gifu College GIS Team
        </div>
      </div>
    </div>
  );
};

export default IndexTemplate;
