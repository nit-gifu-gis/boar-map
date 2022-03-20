import { useState } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import Spacer from '../../atomos/spacer';
import TraceData from '../../atomos/traceData';
import Header from '../../organisms/header';
import TraceForm from '../../organisms/traceForm';
import { isError, QueryError, QueryResult } from './interface';

const TraceTemplate: React.FunctionComponent = () => {
  const [searchResult, setSearchResult] = useState<QueryError | QueryResult | null>(null);

  const onSubmit = async (boarNo: string) => {
    const data = {
      check_no: boarNo,
    };

    const result = await fetch(SERVER_URI + '/Features/SearchById', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const response = await result.json();
    if (result.status === 200) {
      setSearchResult(response as QueryResult);
    } else {
      response.status = result.status;
      setSearchResult(response as QueryError);
    }
  };

  return (
    <div>
      <Header>個体検索</Header>
      <div className='mx-auto px-4 pt-3'>
        <TraceForm onSubmit={onSubmit} />
        {searchResult === null ? (
          <></>
        ) : isError(searchResult) ? (
          <div className='mb-7 text-center'>
            <div className='text-lg font-bold text-danger'>
              {searchResult.status === 500
                ? 'サーバー側でエラーが発生しました。'
                : searchResult.reason}
            </div>
          </div>
        ) : (
          <div>
            <div className='text-2xl font-bold'>検索結果</div>
            <TraceData data_key='PCR検査日' value={searchResult.pcr_date.split(' ')[0]} />
            <TraceData data_key='PCR検査結果' value={searchResult.pcr_result} isBottom={true} />
            <Spacer />
            <TraceData data_key='確認番号' value={searchResult.check_no} />
            <TraceData data_key='個体管理番号' value={searchResult.id} isBottom={true} />
            <Spacer />
            <TraceData data_key='市町村' value={searchResult.city} />
            <TraceData data_key='地名' value={searchResult.area} isBottom={true} />
            <Spacer />
            <TraceData data_key='捕獲日' value={searchResult.date.split(' ')[0]} />
            <TraceData data_key='捕獲区分' value={searchResult.division} isBottom={true} />
            <Spacer />
            <TraceData data_key='性別' value={searchResult.gender} />
            <TraceData data_key='成子の別' value={searchResult.is_child ? '幼獣' : '成獣'} />
            <TraceData data_key='体長' value={`${searchResult.length} cm`} />
            <TraceData data_key='体重' value={`${searchResult.weight} kg`} isBottom={true} />
          </div>
        )}
        <div className='mb-5 text-center'>
          <span>(c) 2019-2021 National Institute of Technology, </span>
          <span>Gifu College GIS Team</span>
        </div>
      </div>
    </div>
  );
};

export default TraceTemplate;
