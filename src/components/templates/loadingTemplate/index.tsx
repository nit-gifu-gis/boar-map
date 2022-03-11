import Image from 'next/image';

const LoadingTemplate: React.FunctionComponent = () => {
  return (
    <div className='flex h-screen min-h-screen items-center justify-center overflow-auto'>
      <div className='text-center'>
        <Image
          src='/login.png'
          alt='main logo'
          className='container__image'
          width='250'
          height='71'
        />
        <h1>いのししマップぎふ</h1>
        <div>
          <span>岐阜県家畜対策公式Webアプリ</span>
        </div>
        <Image src='/spinner.gif' alt='Loading Icon' width='100' height='100'></Image>
        <span className='block text-xl'>ロード中...</span>
      </div>
    </div>
  );
};

export default LoadingTemplate;
