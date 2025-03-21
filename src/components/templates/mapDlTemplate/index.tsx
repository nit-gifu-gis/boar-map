import { useCallback, useEffect, useMemo, useState } from 'react';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { alert } from '../../../utils/modal';
import Header from '../../organisms/header';
import RoundButton from '../../atomos/roundButton';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface MapDLInfo {
  file_no: number;
  file_name: string;
  mesh: string;
}

const MapDLTemplate: React.FunctionComponent = () => {
  const { currentUser } = useCurrentUser();

  const [fileInfo, setFileInfo] = useState<MapDLInfo[]>([]);
  const [currentPrefix, setPrefix] = useState<string | null>(null);

  const indexNo = useMemo(() => {
    const d = fileInfo.map((info, i) => info.mesh.indexOf('インデックス') !== -1 ? i : -1).find((no) => no !== -1);
    return d === undefined ? -1 : d;
  }, [fileInfo]);


  const meshGroups = useMemo(() => {
    const prefixList: string[] = [];
    const prefixInfo: { [key: string]: {min: number, max: number, values: ({ key: number | string, label: string, file_no: number })[] } } = {};
    fileInfo.forEach((info) => {
      if (info.mesh.includes('インデックス')) return;

      const match = info.mesh.match(/(?<prefix>[A-Za-z]+)-(?<no>\d+)/);

      const prefix = !match || !match.groups ? "その他" : match.groups.prefix;
      const no = !match || !match.groups ? info.mesh : parseInt(match.groups.no);

      if (!prefixList.includes(prefix)) {
        prefixList.push(prefix);
        prefixInfo[prefix] = { min: (prefix === "その他") ? 0 : no as number, max: (prefix === "その他") ? 0 : no as number, values: [] };
      }

      prefixInfo[prefix].values.push({ key: no, label: info.mesh, file_no: info.file_no });

      if (prefix !== "その他") {
        prefixInfo[prefix].min = Math.min(prefixInfo[prefix].min, no as number);
        prefixInfo[prefix].max = Math.max(prefixInfo[prefix].max, no as number);
      }
    });

    for (const key in prefixInfo) {
      prefixInfo[key].values = prefixInfo[key].values.sort((a, b) => {
        if (typeof a.key === 'string' && typeof b.key === 'string') {
          return a.key.localeCompare(b.key);
        } else {
          return (a.key as number) - (b.key as number);
        }
      });
    }

    return {
      prefixList: prefixList.sort(),
      prefixInfo: prefixInfo
    };
  }, [fileInfo]);

  useEffect(() => {
    if (!currentUser) return;

    const asyncTask = async () => {
      const res = await fetch(SERVER_URI + '/Mesh/Map', {
        headers: {
          'X-Access-Token': getAccessToken()
        }
      });

      if (res.status !== 200) {
        await alert('エラーが発生しました。');
        return;
      }

      const req = await res.json();
      setFileInfo(req);
    };
    asyncTask();
  }, [currentUser]);

  const onClickDownload = useCallback(async (file_no: number) => {
    const info = fileInfo.find((info) => info.file_no === file_no);
    if (!info) {
      alert('エラーが発生しました。');
      return;
    }

    setDownloading(true);

    const res = await fetch(SERVER_URI + `/Mesh/Map?id=${file_no}`, {
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });

    if (res.status !== 200) {
      alert('エラーが発生しました。');
      setDownloading(false);
      return;
    }

    setDownloading(false);

    const blob = await res.blob();
    const anchor = document.createElement('a');

    const name = info.file_name;
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
  }, [fileInfo]);

  const [downloading, setDownloading] = useState(false);

  return (
    <div className='w-screen bg-background'>
      <Header color='primary'>地図のダウンロード</Header>
      <div className="flex justify-center">
        <div className='my-3 mx-3 max-w-[500px]'>
          {!fileInfo.length ? 
            <span>読み込み中...</span> : 
            downloading ? (
              <div className='box-border w-full rounded-[10px] border-2 border-solid border-border py-[10px] px-3'>
                <div className="font-bold text-2xl">ダウンロード中...</div>
                <div>ダウンロード完了までしばらくお待ちください...</div>
              </div>
            ) : (
              <div className='box-border w-full rounded-[10px] border-2 border-solid border-border py-[10px] px-3'>
                <span className="font-bold">ダウンロードしたい地図のメッシュ番号を選択してください。</span>
                <ul className="list-disc list-inside">
                  { currentPrefix === null ? (
                    <>
                      {indexNo !== -1 ? <li className="underline cursor-pointer text-accent text-xl my-1" onClick={() => onClickDownload(fileInfo[indexNo].file_no)}>インデックス</li> : undefined}
                      {meshGroups.prefixList.map((prefix) => (
                        <li key={prefix} className="underline cursor-pointer text-accent text-xl my-1" onClick={() => setPrefix(prefix)}>
                          {prefix === "その他" ? "その他" : `${prefix}-${meshGroups.prefixInfo[prefix].min} ～ ${prefix}-${meshGroups.prefixInfo[prefix].max}`}
                        </li>
                      ))}
                    </>
                  ) : (
                    <>
                      {meshGroups.prefixInfo[currentPrefix].values.map((value) => (
                        <li key={value.label} className="underline cursor-pointer text-accent text-xl my-1" onClick={() => onClickDownload(value.file_no)}>
                          {value.label}
                        </li>
                      ))}
                      <div className='mx-auto max-w-[400px] py-5'>
                        <RoundButton color="accent" onClick={() => setPrefix(null)}>
                          戻る
                        </RoundButton>
                      </div>
                    </>
                  )}
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MapDLTemplate;