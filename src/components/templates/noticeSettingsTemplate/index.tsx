import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { Notice } from '../loginTemplate/interface';
import TextInput from '../../atomos/TextInput';
import TextAreaInput from '../../atomos/textAreaInput';

const NoticeSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [notice, setNotice] = useState<Notice[]>([]);

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [inputsMessage, setInputsMessage] = useState('');
  const [, setMessageDeleteTimerId] = useState<NodeJS.Timeout | null>(null);
  const [, setInputsMessageDeleteTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    const asyncTask = async () => {
      const req = await fetch(`${SERVER_URI}/Settings/Notice`);
      const res = await req.json();
      setNotice(res.data);
    };

    asyncTask();

    return () => {
      setMessageDeleteTimerId((id) => {
        if (id != null) {
          clearTimeout(id);
        }
        return id;
      });
    };
  }, []);

  const onUpdateClicked = useCallback(async () => {
    setButtonDisabled(true);

    const req = await fetch(`${SERVER_URI}/Settings/Notice`, {
      method: 'POST',
      headers: {
        'X-Access-Token': getAccessToken(),
      },
      body: JSON.stringify({
        data: notice,
      }),
    });

    const message = req.ok ? '設定を更新しました。' : `エラーが発生しました。(${req.status})`;
    setInputsMessageDeleteTimerId((id) => {
      setInputsMessage(message);

      if (id != null) clearTimeout(id);

      return setTimeout(() => {
        setInputsMessage('');
      }, 4000);
    });
    setButtonDisabled(false);
  }, [notice]);

  const onNewClicked = useCallback(() => {
    const newNotice = [...notice];
    newNotice.push({
      title: '',
      content: '',
    });
    setNotice(newNotice);
  }, [notice]);

  const onDeleteClicked = useCallback((index: number) => {
    const newNotice = [...notice];
    newNotice.splice(index, 1);
    setNotice(newNotice);
  }, [notice]);

  const onClickUp = useCallback((index: number) => {
    if (index == 0) return;

    const newNotice = [...notice];
    const tmp = newNotice[index - 1];
    newNotice[index - 1] = newNotice[index];
    newNotice[index] = tmp;
    setNotice(newNotice);
  }, [notice]);
  const onClickDown = useCallback((index: number) => {
    if (index + 1 >= notice.length) return;

    const newNotice = [...notice];
    const tmp = newNotice[index + 1];
    newNotice[index + 1] = newNotice[index];
    newNotice[index] = tmp;
    setNotice(newNotice);
  }, [notice]);

  const onChangeTitle = useCallback((index: number, value: string) => {
    const newNotice = [...notice];
    newNotice[index].title = value;
    setNotice(newNotice);
  }, [notice]);
  const onChangeBody = useCallback((index: number) => {
    const body = document.getElementById(`body_${index}`) as HTMLTextAreaElement;
    if (body == null) return;
    
    const newNotice = [...notice];
    newNotice[index].content = body.value;
    setNotice(newNotice);
  }, [notice]);

  return (
    <div>
      <Header color='primary'>お知らせ設定</Header>
      {notice.length === 0 ? (
        <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
          <div className='text-xl font-bold'>
            お知らせはありません。
          </div>
        </div>
      ) : <></>}
      {notice.map((n, i, a) => (
        <div className='mx-auto w-full max-w-[400px] bg-background py-3' key={`notice_${i}`}>
          <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
            <div className='text-2xl font-bold flex flex-wrap items-center'>
              <div className="mx-3">お知らせ{i + 1}</div>
            </div>
            <div className='flex flex-wrap items-center'>
              <div className="w-32">
                <RoundButton color='danger' onClick={() => onDeleteClicked(i)}>削除</RoundButton>
              </div>
              <div className="w-16 mx-2">
                <RoundButton color="accent" onClick={() => onClickUp(i)} disabled={i == 0}>↑</RoundButton>
              </div>
              <div className="w-16 mx-2">
                <RoundButton color="accent" onClick={() => onClickDown(i)} disabled={(i + 1) >= a.length}>↓</RoundButton>
              </div>
            </div>
            <div className='m-[15px]'>
              <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
                お知らせタイトル
                <TextInput
                  type='text'
                  id={`title_${i}`}
                  name={`title_${i}`}
                  onChange={(e) => onChangeTitle(i, e.target.value)}
                  value={n.title}
                />
              </div>
            </div>
            <div className='m-[15px]'>
              <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
                お知らせ本文
              </div>
              <div>
                <TextAreaInput
                  id={`body_${i}`}
                  rows={5}
                  onChange={() => onChangeBody(i)}
                  value={n.content}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <RoundButton color='excel' onClick={onNewClicked} disabled={buttonDisabled}>
          新規追加
        </RoundButton>
      </div>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <RoundButton color='primary' onClick={onUpdateClicked} disabled={buttonDisabled}>
          保存
        </RoundButton>
        <div className='pt-3 text-center'>
          <span>{inputsMessage}</span>
        </div>
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings')} color='accent'>
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default NoticeSettingsTemplate;