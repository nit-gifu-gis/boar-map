import { useEffect, useMemo, useState } from 'react';
import InfoDiv from '../../molecules/infoDiv';
import { ReportBBodyValue, ReportInfoViewProps } from './interface';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { useRouter } from 'next/router';
import { alert } from '../../../utils/modal';

const ReportInfoView: React.FunctionComponent<ReportInfoViewProps> = ({
  detail,
  confirmMode,
}) => {
  const router = useRouter();

  const [reportBValue, setReportBValue] = useState<ReportBBodyValue | undefined>(undefined);

  const parsedWorkValue = useMemo(() => {
    const data = {
      trap: {
        placed: 0,
        removed: 0
      },
      capture: false,
      crawl: false,
      capture_type: {
        own: false,
        help: false,
        mistake: false
      }
    };

    if (!detail.properties.作業内容) {
      return data;
    }


    // データ構造は下記の通り (スラッシュは未チェック時も挿入される)
    // (わな設置)/(撤去)/(見回り(チェック時))/(捕獲(チェック時))
    // 自身のわな/捕獲手伝い/錯誤捕獲

    const lines = detail.properties.作業内容.split('\n');
    const trap = (lines[0] || '').split('/');
    data.trap.placed = isNaN(parseInt(trap[0])) ? 0 : parseInt(trap[0]);
    data.trap.removed = isNaN(parseInt(trap[1])) ? 0 : parseInt(trap[1]);
    if (trap[2] === '見回り') {
      data.crawl = true;
    }
    if (trap[3] === '捕獲') {
      data.capture = true;
    }

    const capture = (lines[1] || '').split('/');
    data.capture_type.own = capture[0] === '自身のわな';
    data.capture_type.help = capture[1] === '捕獲手伝い';
    data.capture_type.mistake = capture[2] === '錯誤捕獲';

    return data;
  }, [detail.properties.作業内容]);

  const parsedMistakeValue = useMemo(() => {
    const data = {
      trap_type: '',
      head_count: 0,
      response: '',
      animal_type: {
        deer: false,
        serow: false,
        boar: false,
        other: false
      },
      animal_other: ''
    };

    if (!detail.properties.錯誤捕獲) {
      return data;
    }

    // データ構造は下記の通り
    // わなの種類
    // 頭数
    // 対応
    // (ニホンジカ(チェック時))/(カモシカ(チェック時))/(ツキノワグマ(チェック時))/(その他(チェック時))
    // その他の場合の獣種

    const lines = detail.properties.錯誤捕獲.split('\n');
    data.trap_type = (lines[0] || '');
    data.head_count = isNaN(parseInt(lines[1])) ? 0 : parseInt(lines[1]);
    data.response = (lines[2] || '');
    
    const animal = (lines[3] || '').split('/');
    data.animal_type.deer = animal[0] === 'ニホンジカ';
    data.animal_type.serow = animal[1] === 'カモシカ';
    data.animal_type.boar = animal[2] === 'ツキノワグマ';
    data.animal_type.other = animal[3] === 'その他';

    data.animal_other = lines[4];

    return data;
  }, [detail.properties.錯誤捕獲]);

  const parsedToolValue = useMemo(() => {
    // データ構造は下記の通り
    // (電気とめさし器(チェック時))/(銃(チェック時))/(その他(チェック時))
    // その他の場合の内容
    const data = {
      tool: {
        elec: false,
        gun: false,
        other: false
      },
      other_tool: ''
    };
    
    if (!detail.properties.止刺道具) {
      return data;
    }
        
    const lines = detail.properties.止刺道具.split('\n');
    const tool = (lines[0] || '').split('/');
    data.tool.elec = tool[0] === '電気とめさし器';
    data.tool.gun = tool[1] === '銃';
    data.tool.other = tool[2] === 'その他';
    
    data.other_tool = lines[1];
    
    return data;
  }, [detail.properties.止刺道具]);

  useEffect(() => {   
    const asyncTask = async () => {
      const response = await fetch(`${SERVER_URI}/Features/ReportCalc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify({
          date: detail.properties.作業開始時,
          user: detail.properties.入力者
        }),
      });

      if (!response.ok) {
        alert('データの取得に失敗しました。');
        router.push('/map');
        return;
      }

      const json = await response.json();
      setReportBValue(json);
    };

    asyncTask();
  }, [confirmMode]);

  return (
    reportBValue != undefined ? (
      <div className='box-border w-full'>
        <InfoDiv
          title='場所'
          type='location'
          data={{ lat: detail.geometry.coordinates[1], lng: detail.geometry.coordinates[0] }}
        />
        <InfoDiv title='所属支部名' type='text' data={detail.properties.所属支部名} />
        <InfoDiv title='氏名' type='text' data={detail.properties.氏名} />
        <InfoDiv title="わなの場所(市町村・字)" data={detail.properties.市町村字} />
        <InfoDiv title="わなの場所(ワクチンメッシュ番号)" data={detail.properties.ワクチンNO} />
        <InfoDiv
          title='作業時間'
          type='period'
          data={{ start: detail.properties.作業開始時, end: detail.properties.作業終了時 }}
        />
        <InfoDiv title='作業内容' type='work' data={[parsedWorkValue, parsedMistakeValue]} />
        <InfoDiv title='作業報告・状況報告' type='text' data={detail.properties.作業報告} />
        <InfoDiv title='作業報告B' type='workB' data={[reportBValue, detail.properties.捕獲補助, parsedToolValue]} />
        <InfoDiv title='備考' type='text' data={detail.properties.備考} />
      </div>
    ) : (
      <div className='pt-6 text-center text-3xl font-bold'>読み込み中...</div>
    )
  );
};

export default ReportInfoView;
