import InfoDiv from '../../molecules/infoDiv';
import { ButanetsuInfoViewProps } from './interface';

const ButanetsuInfoView: React.FunctionComponent<ButanetsuInfoViewProps> = ({ detail }) => {
  return (
    <div className='box-border w-full'>
      <InfoDiv
        title='場所'
        type='location'
        data={{ lat: detail.geometry.coordinates[1], lng: detail.geometry.coordinates[0] }}
      />
      <InfoDiv title='捕獲日' type='date' data={detail.properties.捕獲年月日} />
      <InfoDiv title='県番号' type='text' data={detail.properties.県番号} />
    </div>
  );
};

export default ButanetsuInfoView;
