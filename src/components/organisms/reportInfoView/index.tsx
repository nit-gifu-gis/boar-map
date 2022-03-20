import InfoDiv from '../../molecules/infoDiv';
import { ReportInfoViewProps } from './interface';

const ReportInfoView: React.FunctionComponent<ReportInfoViewProps> = ({
  detail,
  objectURLs,
  imageIDs,
  confirmMode,
}) => {
  return (
    <div className='box-border w-full'>
      <InfoDiv
        title='場所'
        type='location'
        data={{ lat: detail.geometry.coordinates[1], lng: detail.geometry.coordinates[0] }}
      />
      <InfoDiv
        title='画像'
        type='images'
        data={{
          type: 'trap',
          objectURLs: objectURLs,
          confirmMode: confirmMode,
          imageIDs:
            imageIDs != null ? imageIDs : detail.properties.画像ID.split(',').filter((e) => e),
        }}
      />
      <InfoDiv title='地域（農林事務所単位）' type='text' data={detail.properties.地域} />
      <InfoDiv title='所属支部名' type='text' data={detail.properties.所属支部名} />
      <InfoDiv title='氏名' type='text' data={detail.properties.氏名} />
      <InfoDiv
        title='作業時間'
        type='period'
        data={{ start: detail.properties.作業開始時, end: detail.properties.作業終了時 }}
      />
      <InfoDiv title='作業報告・状況報告' type='text' data={detail.properties.作業報告} />
      <InfoDiv title='備考' type='text' data={detail.properties.備考} />
    </div>
  );
};

export default ReportInfoView;
