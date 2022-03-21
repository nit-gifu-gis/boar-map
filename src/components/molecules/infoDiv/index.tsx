import ImageListView from '../../atomos/imageListView';
import InfoText from '../../atomos/infoText';
import MiniMap from '../../atomos/miniMap';
import InfoTitle from '../../atomos/infoTitle';
import { InfoDivProps } from './interface';

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
