import InfoDiv from '../../molecules/infoDiv';
import { YoutonInfoViewProps } from './interface';

const YoutonInfoView: React.FunctionComponent<YoutonInfoViewProps> = ({ detail }) => {
  return (
    <div className='box-border w-full'>
      <InfoDiv
        title='場所'
        type='location'
        data={{ lat: detail.geometry.coordinates[1], lng: detail.geometry.coordinates[0] }}
      />
      <InfoDiv title='施設名' type='text' data={detail.properties.施設名} />
      <InfoDiv title='農場区分' type='text' data={detail.properties.農場区分} />
      <InfoDiv title='肥育/繁殖の別' type='text' data={detail.properties.肥育繁殖別} />
      <InfoDiv title='経営者' type='text' data={detail.properties.経営者} />
      <InfoDiv title='市町村' type='text' data={detail.properties.市町村} />
      <InfoDiv title='地名' type='text' data={detail.properties.地名} />
      <InfoDiv title='飼養頭数' type='number' data={detail.properties.飼養頭数} unit='頭' />
      <InfoDiv title='更新年月日' type='date' data={detail.properties.更新日} />
    </div>
  );
};

export default YoutonInfoView;
