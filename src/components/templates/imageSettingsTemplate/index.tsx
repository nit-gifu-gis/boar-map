import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { alert, confirm } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import InfoInput from '../../molecules/infoInput';

interface ServerSpace {
  free: number;
  total: number;
}

const ImageSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [space, setSpace] = useState<ServerSpace | null>(null);

  const [isDownloadError, setIsDownloadError] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const friendlySpace = useMemo(() => {
    if (space == null) return null;

    const usedPct = Math.round((space.total - space.free) / space.total * 100);
    const freeGB = Math.round(space.free / 1024 / 1024 / 1024);
    const totalGB = Math.round(space.total / 1024 / 1024 / 1024);

    return {
      usedPct,
      freeGB,
      totalGB,
    };
  }, [space]);

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    fetchSpace();
  }, [currentUser]);

  const fetchSpace = useCallback(async () => {
    if(currentUser == null) return;

    const res = await fetch(`${SERVER_URI}/Image/GetSpace`, {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    const data = await res.json();
    setSpace(data);
  }, [currentUser]);

  const onClickDownload = useCallback(async () => {
    setIsDownloadError(false);
    const from = (document.getElementById('download_from') as HTMLInputElement).value;
    const to = (document.getElementById('download_to') as HTMLInputElement).value;
    const order = (document.getElementById('download_order') as HTMLSelectElement).value;

    if (from === '' || to === '') {
      setIsDownloadError(true);
      alert('日付を入力してください。');
      return;
    }

    if (from > to) {
      setIsDownloadError(true);
      alert('日付の前後関係が正しくありません。');
      return;
    }

    setIsDisabled(true);

    const res = await fetch(SERVER_URI + `/Image/Download`, {
      headers: {
        'X-Access-Token': getAccessToken()
      },
      body: JSON.stringify({
        date_from: from,
        date_to: to,
        order: order,
      }),
      method: 'POST',
    });

    if (res.status !== 200) {
      alert('エラーが発生しました。');
      setIsDisabled(false);
      return;
    }

    setIsDisabled(false);

    const blob = await res.blob();
    const anchor = document.createElement('a');

    const name = "画像ダウンロード.zip";
    // IE対応
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.navigator.msSaveBlob) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.navigator.msSaveBlob(blob, name);
      return;
    }
    anchor.download = name;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
  }, []);

  const onClickDelete = useCallback(async () => {
    setIsDeleteError(false);

    const from = (document.getElementById('delete_from') as HTMLInputElement).value;
    const to = (document.getElementById('delete_to') as HTMLInputElement).value;

    if (from === '' || to === '') {
      setIsDeleteError(true);
      alert('日付を入力してください。');
      return;
    }

    if (from > to) {
      setIsDeleteError(true);
      alert('日付の前後関係が正しくありません。');
      return;
    }

    if (!await confirm("本当に削除してもよろしいですか？")) {
      return;
    }

    const res = await fetch(SERVER_URI + `/Image/DeleteAll`, {
      headers: {
        'X-Access-Token': getAccessToken()
      },
      body: JSON.stringify({
        date_from: from,
        date_to: to,
      }),
      method: 'POST',
    });

    if (res.status !== 200) {
      alert('エラーが発生しました。');
      setIsDisabled(false);
      return;
    }

    setIsDisabled(false);

    alert('削除が完了しました。');
  }, []);

  return (
    <div>
      <Header color='primary'>画像サーバー設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3 px-3'>
        {friendlySpace == null ? <></> : (
          <div>
            現在 {friendlySpace.freeGB} GBの空き容量がサーバーに残っています。<br />
            (全体容量: {friendlySpace.totalGB} GB、使用率: {friendlySpace.usedPct}%)
          </div>
        )}
      </div>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='text-2xl font-bold'>画像ダウンロード</div>
        <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
          <InfoInput type='date' id='download_from' title='ダウンロード対象日（開始）' error={isDownloadError ? " " : ""}/>
          <InfoInput type='date' id='download_to' title='ダウンロード対象日（終了）' error={isDownloadError ? " " : ""} />
          <InfoInput
            title='画像ファイルのグループ分け'
            type='select'
            id='download_order'
            options={['ID$', '入力者', 'しない']}
          />
          <RoundButton color='primary' onClick={onClickDownload} disabled={isDisabled}>
            ダウンロード
          </RoundButton>
        </div>
      </div>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='text-2xl font-bold'>画像削除</div>
        <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
          <div className='pb-3 text-left'>
            <span>
              <span className="underline font-bold text-danger">注意</span><br />
              一度削除した画像は復元することが出来ません。<br />
              削除を行う場合には十分にご注意ください。
            </span>
            <InfoInput type='date' id='delete_from' title='削除対象日（開始）' error={isDeleteError ? " " : ""} />
            <InfoInput type='date' id='delete_to' title='削除対象日（終了）' error={isDeleteError ? " " : ""} />
            <RoundButton color='danger' onClick={onClickDelete} disabled={isDisabled}>
              削除
            </RoundButton>
          </div>
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

export default ImageSettingsTemplate;
