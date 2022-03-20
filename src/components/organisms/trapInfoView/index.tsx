import InfoDiv from '../../molecules/infoDiv';
import { TrapInfoViewProps } from './interface';

const TrapInfoView: React.FunctionComponent<TrapInfoViewProps> = ({
  detail,
  objectURLs,
  imageIDs,
  confirmMode,
}) => {
  let removedDiv: JSX.Element | null = null;
  if (detail.properties.撤去年月日 != '') {
    removedDiv = <InfoDiv title='撤去年月日' type='date' data={detail.properties.撤去年月日} />;
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
      <InfoDiv title='設置年月日' type='date' data={detail.properties.設置年月日} />
      <InfoDiv title='わなの種類' type='text' data={detail.properties.罠の種類} />
      <InfoDiv title='捕獲の有無' type='text' data={detail.properties.捕獲の有無} />
      {removedDiv}
    </div>
  );
};

export default TrapInfoView;
