import { NextPage } from 'next';
import { useState } from 'react';
import { SERVER_URI } from '../utils/constants';
import Spacer from '../components/atomos/spacer';
import TraceData from '../components/atomos/traceData';
import Header from '../components/organisms/header';
import TraceForm from '../components/organisms/traceForm';
import { useTranslation } from '../i18n/useTranslation';

export interface QueryError {
  status: number;
  reason: string;
}

export interface QueryResult {
  area: string;
  check_no: number;
  city: string;
  date: string;
  division: string;
  gender: string;
  id: string;
  is_child: boolean;
  length: number;
  pcr_date: string;
  pcr_result: string;
  weight: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isError = (arg: any): arg is QueryError => {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    typeof arg.reason === 'string' &&
    typeof arg.status === 'number'
  );
};

const TracePage: NextPage = () => {
  const [searchResult, setSearchResult] = useState<QueryError | QueryResult | null>(null);
  const { t } = useTranslation();

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
    <>
      <div>
        <Header>{t('id-search')}</Header>
        <div className='mx-auto px-4 pt-3'>
          <TraceForm onSubmit={onSubmit} />
          {searchResult === null ? (
            <></>
          ) : isError(searchResult) ? (
            <div className='mb-7 text-center'>
              <div className='text-lg font-bold text-danger'>
                {searchResult.status === 500 ? t('error-500') : searchResult.reason}
              </div>
            </div>
          ) : (
            <div>
              <div className='text-2xl font-bold'>{t('result-search')}</div>
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
            </div>
          )}
          <div className='mb-5 text-center'>
            <span>(c) 2019-2021 National Institute of Technology, </span>
            <span>Gifu College GIS Team</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TracePage;
