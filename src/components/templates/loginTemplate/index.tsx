import Image from 'next/image';
import Header from '../../organisms/header';
import LoginForm from '../../organisms/loginForm';
import { LoginProps } from './interface';
import RoundButton from '../../atomos/roundButton';
import { REPORT_FORM_URL } from '../../../utils/constants';

const LoginTemplate: React.FunctionComponent<LoginProps> = ({ version }: LoginProps) => {
  const openReportForm = () => {
    window.open(REPORT_FORM_URL);
  };

  return (
    <div className='w-screen'>
      <Header>ログイン</Header>
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
        <div className='w-auto text-center text-lg text-small-text'>
          <span className='inline-block'>{version.latestNumber}</span>
        </div>
        <LoginForm />
        <hr />
        <div className="box-border rounded-2xl border-2 border-border my-2 px-3 py-2">
          <span className="font-bold">お知らせ (2024/7/5追加)</span><br />
          只今、一覧表での登録情報の検索の際に<br />
          市町村を指定すると、今年の2～4月の情報が<br />
          出ないことがあります。<br />
          復旧までしばらくお待ちください。<br />
          ご迷惑をおかけしております。<br />
        </div>
        <div className="box-border rounded-2xl border-2 border-border my-2 px-3 py-2">
          改修中のため入力項目等が<br />
          変更になる場合があります。<br />
          <br />
          不具合等が発生した場合は、<br />
          下記にご連絡ください。<br />
          Tel. <a href="tel:0582728096" className="text-[#0000ff] underline font-bold">058-272-8096</a><br />(平日8:30～12:00、13:00〜17:15)<br />
          <br />
          検体提供のご報告は、<br />
          電話又はFAXでも受け付けています。<br />
          Tel. <a href="tel:0582728096" className="text-[#0000ff] underline font-bold">058-272-8096</a><br />(平日8:30～12:00、13:00〜17:15)<br />
          Fax. <span className="font-bold">058-278-3533</span><br />
          <div className='my-3'>
            <RoundButton color="excel" onClick={openReportForm}>
              検体提供報告書様式
            </RoundButton>
          </div>
        </div>
        <div className='pt-8 text-center'>
          &copy; 2019-2022 National Institute of Technology, Gifu College GIS Team
        </div>
      </div>
    </div>
  );
};

export default LoginTemplate;
