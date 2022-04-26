import { useEffect, useState } from "react";
import { FeatureBase } from "../../../types/features";
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
    await alert("Downlaod clicked.");
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