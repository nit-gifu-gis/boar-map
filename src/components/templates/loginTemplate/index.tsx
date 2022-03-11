import Image from 'next/image';
import LoginForm from '../../organisms/loginForm';
import { LoginProps } from './interface';

const LoginTemplate: React.FunctionComponent<LoginProps> = ({ version }: LoginProps) => {
  return (
    <div className='mx-auto box-border w-screen max-w-sm px-2'>
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
      <div className='w-auto text-center text-lg text-small-text'>
        <span className='inline-block'>{version.latestNumber}</span>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginTemplate;
