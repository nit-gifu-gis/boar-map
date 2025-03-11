import { useEffect, useState } from 'react';
import Header from '../../organisms/header';
import { Notice } from '../loginTemplate/interface';
import { SERVER_URI } from '../../../utils/constants';
import RoundButton from '../../atomos/roundButton';
import { useRouter } from 'next/router';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

const NoticeTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { isAuthChecking, currentUser } = useCurrentUser();
  const [notice, setNotice] = useState<Notice[] | null>(null);

  useEffect(() => {
    const asyncTask = async () => {
      const req = await fetch(`${SERVER_URI}/Settings/Notice`);
      const res = await req.json();
      setNotice(res);
    };

    asyncTask();
  }, []);

  return (
    <div className='w-screen bg-background'>
      <Header color='primary'>お知らせ</Header>
      <div className='mx-auto box-border w-screen max-w-window px-2'>
        {notice ? notice.length ? (
          notice.map((n, i) => (
            <div className="box-border rounded-2xl border-2 border-border my-2 px-3 py-2" key={"notice_" + i}>
              <span className="font-bold">{n.title}</span><br />
              <span className="whitespace-pre-wrap">{n.content}</span>
            </div>
          ))
        ) : (
          <div className="font-bold text-2xl my-2">
            現在お知らせはありません。
          </div>
        ) : (
          <div className="font-bold text-2xl my-2">
            読み込み中...
          </div>
        )}
        { isAuthChecking || currentUser ? (
          <div className='my-3'>
            <RoundButton color="accent" onClick={() => router.push('/map')}>
              マップへ戻る
            </RoundButton>
          </div>
        ) : (
          <div className='my-3'>
            <RoundButton color="accent" onClick={() => router.push('/login')}>
              ログイン画面へ戻る
            </RoundButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeTemplate;