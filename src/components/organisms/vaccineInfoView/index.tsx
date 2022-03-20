import InfoDiv from '../../molecules/infoDiv';
import { VaccineInfoViewProps } from './interface';

const VaccineInfoView: React.FunctionComponent<VaccineInfoViewProps> = ({
  detail,
  objectURLs,
  imageIDs,
  confirmMode,
}) => {
  let recoverDiv: JSX.Element | null = null;
  if (detail.properties.回収年月日 != '') {
    recoverDiv = (
      <>
        <InfoDiv title='回収年月日' type='date' data={detail.properties.回収年月日} />
        <InfoDiv title='いのししの摂食数' type='text' data={detail.properties.摂食数} />
        <InfoDiv title='その他の破損数' type='text' data={detail.properties.その他の破損数} />
        <InfoDiv title='破損なし' type='text' data={detail.properties.破損なし} />
        <InfoDiv title='ロスト数' type='text' data={detail.properties.ロスト数} />
      </>
    );
  }
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
      <InfoDiv title='メッシュ番号' type='text' data={detail.properties.メッシュNO} />
      <InfoDiv title='散布年月日' type='date' data={detail.properties.散布年月日} />
      <InfoDiv title='散布数' type='number' data={detail.properties.散布数} />
      {recoverDiv}
      <InfoDiv title='備考' type='text' data={detail.properties.備考} />
    </div>
  );
};

export default VaccineInfoView;
