import ImageListView from '../../atomos/imageListView';
import InfoText from '../../atomos/infoText';
import MiniMap from '../../atomos/miniMap';
import InfoTitle from '../../atomos/infoTitle';
import { InfoDivProps } from './interface';
import { MistakeValue, ReportBServerValue, ToolValue, WorkValue } from '../../organisms/reportInfoView/interface';

const InfoDiv: React.FunctionComponent<InfoDivProps> = ({ type, data, unit, title }) => {
  const getTimeStr = (date_str: string): string => {
    const date = new Date(date_str);
    return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
  };

  let dataDiv = <></>;

  let date: Date | null = null;
  let img_rec: Record<string, boolean | string[] | string> | null = null;
  let per_rec: Record<string, string> | null = null;
  if (!data) {
    // データがないとき
    dataDiv = <InfoText>&nbsp;</InfoText>;
  } else {
    // データがあるとき
    switch (type) {
      case 'date':
        date = new Date(data as string);
        dataDiv = (
          <InfoText>
            {date.getFullYear() +
              ' / ' +
              ('0' + (date.getMonth() + 1)).slice(-2) +
              ' / ' +
              ('0' + date.getDate()).slice(-2)}
          </InfoText>
        );
        break;
      case 'number':
        dataDiv = <InfoText>{(data as string) + ' ' + (unit != null ? unit : '')}</InfoText>;
        break;
      case 'location':
        dataDiv = (
          <MiniMap
            lat={(data as Record<string, number>).lat}
            lng={(data as Record<string, number>).lng}
          />
        );
        break;
      case 'images':
        img_rec = data as Record<string, string | boolean | string[]>;
        dataDiv = (
          <ImageListView
            objectURLs={img_rec.objectURLs as string[]}
            imageIDs={img_rec.imageIDs as string[]}
            confirmMode={img_rec.confirmMode as boolean}
          />
        );
        break;
      case 'gray':
        dataDiv = <InfoText is_gray={true}>{data}</InfoText>;
        break;
      case 'period':
        per_rec = data as Record<string, string>;
        date = new Date(per_rec.start);
        dataDiv = (
          <>
            <InfoText>
              {date.getFullYear() +
                ' / ' +
                ('0' + (date.getMonth() + 1)).slice(-2) +
                ' / ' +
                ('0' + date.getDate()).slice(-2)}
            </InfoText>
            <InfoText>{getTimeStr(per_rec.start) + ' ～ ' + getTimeStr(per_rec.end)}</InfoText>
          </>
        );
        break;
      case 'work': {
        const [d1, d2] = data as unknown as [WorkValue, MistakeValue];

        const vals = {
          'deer': 'ニホンジカ',
          'serow': 'カモシカ',
          'boar': 'ツキノワグマ',
          'other': `その他 (${d2.animal_other})`
        };

        dataDiv = (
          <div className="mb-4">
            <div className="text-xl">
              わな設置: {d1.trap.placed}基 / 撤去: {d1.trap.removed}基 {d1.crawl ? "/ 見回り" : ""} {d1.capture ? "/ 捕獲" : ""}<br />
            </div>
            {d1.capture ? (
              <div className="text-lg">
                ({d1.capture_type.own ? "自身の罠で捕獲" : ""}{d1.capture_type.own && d1.capture_type.help ? "・" : ""}{d1.capture_type.help ? "捕獲手伝い" : ""}{(d1.capture_type.help && d1.capture_type.mistake) || (d1.capture_type.own && !d1.capture_type.help && d1.capture_type.mistake) ? "・" : ""}{d1.capture_type.mistake ? "錯誤捕獲" : ""})
              </div>
            ) : <></>}
            {d1.capture_type.mistake ? (
              <>
                <InfoTitle>錯誤捕獲</InfoTitle>
                <div className='inside-border box-border w-full'>
                  <InfoTitle>わなの種類</InfoTitle>
                  <div className="mb-4 text-xl">
                    {d2.trap_type}
                  </div>
                </div>
                <div className='inside-border box-border w-full'>
                  <InfoTitle>獣種</InfoTitle>
                  <div className="mb-4 text-xl">
                    {Object.keys(d2.animal_type).filter((key) => d2.animal_type[key as 'deer' | 'serow' | 'boar' | 'other']).map(d => vals[d as 'deer' | 'serow' | 'boar' | 'other']).join('・')}
                  </div>
                </div>
                <div className='inside-border box-border w-full'>
                  <InfoTitle>頭数</InfoTitle>
                  <div className="mb-4 text-xl">
                    {d2.head_count} 頭
                  </div>
                </div>
                <div className='inside-border box-border w-full'>
                  <InfoTitle>対応</InfoTitle>
                  <div className="mb-4 text-xl">
                    {d2.response}
                  </div>
                </div>
              </>
            ) : <></>}
          </div>
        );
        break;
      }
      case 'workB': {
        const [d1, d2, d3] = data as unknown as [ReportBServerValue, string, ToolValue];
        const vals = {
          'elec': '電気とめさし器',
          'gun': '銃',
          'other': `その他 (${d3.other_tool})`
        };

        dataDiv = (
          <div className="mb-4">
            <div className='inside-border box-border w-full'>
              <InfoTitle>捕獲者氏名</InfoTitle>
              <div className="mb-4 text-xl">
                {d1.捕獲者}
              </div>
            </div>
            <div className='inside-border box-border w-full'>
              <InfoTitle>捕獲補助者氏名</InfoTitle>
              <div className="mb-4 text-xl">
                {d2}
              </div>
            </div>
            <div className='inside-border box-border w-full'>
              <InfoTitle>とめさしの道具</InfoTitle>
              <div className="mb-4 text-xl">
                {Object.keys(d3.tool).filter((key) => d3.tool[key as 'elec' | 'gun' | 'other']).map(d => vals[d as 'elec' | 'gun' | 'other']).join('・')}
              </div>
            </div>
            <InfoTitle>捕獲情報</InfoTitle>
            {Object.keys(d1.捕獲数).filter(key => d1.捕獲数[key as keyof typeof d1.捕獲数].捕獲数 != 0).map((key) => (
              <div className='inside-border box-border w-full' key={key}>
                <InfoTitle>{key.substring(0, 2)}({key.substring(2, 4)})</InfoTitle>
                <div className="mb-4 text-xl">
                  {d1.捕獲数[key as keyof typeof d1.捕獲数].捕獲数} 頭 / {d1.捕獲数[key as keyof typeof d1.捕獲数].体長} cm / {d1.捕獲数[key as keyof typeof d1.捕獲数].処分方法.join('・')}
                </div>
              </div>
            ))}
            <div className='inside-border box-border w-full'>
              <InfoTitle>遠沈管番号</InfoTitle>
              <div className="mb-4 text-xl">
                {d1.遠沈管番号.join('、')}
              </div>
            </div>
            <div className='inside-border box-border w-full'>
              <InfoTitle>わなの種類</InfoTitle>
              <div className="mb-4 text-xl">
                {d1.わなの種類.join('・')}
              </div>
            </div>
          </div>
        );
        break;
      }
      case 'text':
      default:
        dataDiv = <InfoText>{data}</InfoText>;
    }
  }
  return (
    <div className='inside-border box-border w-full px-4'>
      <InfoTitle>{title}</InfoTitle>
      {dataDiv}
    </div>
  );
};

export default InfoDiv;
