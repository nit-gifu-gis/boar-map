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

  return (
    <div className='min-w-[500px] bg-background'>
      <Header color='primary'>一覧表</Header>
      <div className='my-3 mx-3'>
        {currentUser?.userDepartment === 'K' ||
        currentUser?.userDepartment === 'J' ||
        currentUser?.userDepartment === 'D' ? (
          <div className='mx-auto max-w-[400px] py-5'>
            <RoundButton color='excel' onClick={() => router.push('/import')}>
              PCR結果のインポート
            </RoundButton>
          </div>
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
