import { useEffect, useState } from "react";
import { FeatureBase } from "../../../types/features";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { alert } from "../../../utils/modal";
import RoundButton from "../../atomos/roundButton";
import BoarTable from "../boarTable";
import ReportTable from "../reportTable";
import TrapTable from "../trapTable";
import VaccineTable from "../vaccineTable";
import { SearchResultProps } from "./interface";

const SearchResult: React.FunctionComponent<SearchResultProps> = ({ searchInfo, searchResult }) => {
  
  const [isDownloading, setDownloading] = useState(false);

  const onClickDownload = async () => {
    const res = await fetch(SERVER_URI + "/List/Export", {
      method: 'POST',
      body: searchInfo,
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'X-Access-Token': getAccessToken()
      }
    });

    if (res.status === 200) {
      const blob = await res.blob();
      const anchor = document.createElement('a');
      const now = new Date();
      const yyyy = ("0000" + now.getFullYear()).slice(-4);
      const mm = ("00" + (now.getMonth() + 1)).slice(-2);
      const dd = ("00" + now.getDate()).slice(-2);

      const name = searchInfo.get("type") + "一覧表(" + yyyy + "-" + mm + "-" + dd + ").xlsx";
      // IE対応
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.navigator.msSaveBlob) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.navigator.msSaveBlob(blob, name);
        setDownloading(false);
        return;
      }
      anchor.download = name;
      anchor.href = window.URL.createObjectURL(blob);
      anchor.click();
      setDownloading(false);
    } else {
      const json = await res.json();
      await alert(json.error);
    }
  };

  return (
    <div className="inline-block mr-4 w-full">
      <div className="relative text-2xl font-bold h-auto mb-3">
        検索結果
        <div className="inline-block w-52 ml-5">
          <RoundButton
            color="excel"
            onClick={onClickDownload}
            disabled={isDownloading}
          >
            ダウンロード
          </RoundButton>
        </div>
      </div>
      <div>
        {searchInfo.get('type') == "いのしし捕獲地点" ? (
          <BoarTable features={searchResult} />
        ) : searchInfo.get('type') == "わな設置地点" ? (
          <TrapTable features={searchResult} />
        ) : searchInfo.get('type') == "ワクチン散布地点" ? (
          <VaccineTable features={searchResult} />
        ) : searchInfo.get('type') == "作業日報" ? (
          <ReportTable features={searchResult} />
        ) : (
          <>不明なデータ形式です。</>
        )}
      </div>
    </div>
  );
};

export default SearchResult;