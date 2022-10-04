import { useState } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { alert } from '../../../utils/modal';
import Header from '../../organisms/header';
import SearchForm from '../../organisms/searchForm';
import { FeatureBase } from '../../../types/features';
import SearchResult from '../../organisms/searchResult';
import RoundButton from '../../atomos/roundButton';
import { useRouter } from 'next/router';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

const ListTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [searchInfo, setSearchInfo] = useState<FormData | null>(null);
  const [searchResult, setSearchResult] = useState<FeatureBase[] | null>(null);

  const onClickSearch = async (data: FormData) => {
    setSearchInfo(data);
    setSearchResult(null);

    const res = await fetch(SERVER_URI + '/List/Search', {
      method: 'POST',
      body: data,
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });
    if (res.status !== 200) {
      await alert('エラーが発生しました。');
      return;
    }

    const list = (await res.json()) as FeatureBase[];
    if (list.length === 0) {
      await alert('データが1件も見つかりませんでした。');
      return;
    }
    setSearchResult(list);
  };

  const [downloading, setDownloading] = useState(false);

  const downloadYouton = async () => {
    setDownloading(true);
    const res = await fetch(SERVER_URI + '/List/Youton', {
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });

    setDownloading(false);
    if (res.status === 200) {
      const blob = await res.blob();
      const anchor = document.createElement('a');
      const now = new Date();
      const yyyy = ('0000' + now.getFullYear()).slice(-4);
      const mm = ('00' + (now.getMonth() + 1)).slice(-2);
      const dd = ('00' + now.getDate()).slice(-2);

      const name = '養豚場一覧表(' + yyyy + '-' + mm + '-' + dd + ').xlsx';
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
    } else {
      const json = await res.json();
      await alert(json.error);
    }
  }

  return (
    <div className='min-w-[500px] bg-background'>
      <Header color='primary'>一覧表</Header>
      <div className='my-3 mx-3'>
        {currentUser?.userDepartment === 'K' ||
        currentUser?.userDepartment === 'J' ||
        currentUser?.userDepartment === 'D' ? (
          <>
          <div className='mx-auto max-w-[400px] py-5'>
            <RoundButton color='excel' onClick={() => router.push('/import')}>
              データのインポート
            </RoundButton>
          </div>
          <div className='mx-auto max-w-[400px] py-5'>
            <RoundButton color="accent" onClick={() => downloadYouton()} disabled={downloading}>
              {downloading ? "ダウンロード中..." : "養豚場リストのダウンロード"}
            </RoundButton>
          </div>
          </>
        ) : (
          <></>
        )}
        <SearchForm onClick={onClickSearch} />
        {searchInfo != null && searchResult != null ? (
          <SearchResult searchInfo={searchInfo} searchResult={searchResult} />
        ) : (
          <>検索条件に条件を入力して検索してください。</>
        )}
      </div>
    </div>
  );
};

export default ListTemplate;
