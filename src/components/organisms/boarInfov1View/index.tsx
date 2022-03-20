import InfoDiv from '../../molecules/infoDiv';
import { BoarInfov1ViewProps } from './interface';

const BoarInfov1View: React.FunctionComponent<BoarInfov1ViewProps> = ({
  detail,
  objectURLs,
  imageIDs,
  confirmMode,
}) => {
  let pregnantInfo: JSX.Element | null = null;
  let catchNumInfo: JSX.Element | null = null;

  if (detail.properties.性別 === 'メス' && detail.properties['幼獣・成獣'] === '成獣') {
    pregnantInfo = <InfoDiv title='妊娠の状況' type='text' data={detail.properties.妊娠の状況} />;
  }

  if (detail.properties['罠・発見場所'] === '箱わな') {
    const childrenNum = parseInt(detail.properties.幼獣の頭数) || 0;
    const adultsNum = parseInt(detail.properties.成獣の頭数) || 0;
    const catchNum = parseInt(detail.properties.捕獲頭数) || 0;
    catchNumInfo = (
      <InfoDiv
        title='捕獲頭数'
        type='text'
        data={`${catchNum} （幼獣: ${childrenNum} 成獣: ${adultsNum}）`}
      />
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
          type: 'boar',
          objectURLs: objectURLs,
          confirmMode: confirmMode,
          imageIDs:
            imageIDs != null ? imageIDs : detail.properties.画像ID.split(',').filter((e) => e),
        }}
      />
      <InfoDiv title={'メッシュ番号'} type='text' data={detail.properties.メッシュ番号} />
      <InfoDiv title='区分' type='text' data={detail.properties.区分} />
      <InfoDiv title='捕獲年月日' type='date' data={detail.properties.捕獲年月日} />
      <InfoDiv title='わな・発見場所' type='text' data={detail.properties['罠・発見場所']} />
      {catchNumInfo}
      <InfoDiv title='幼獣・成獣の別' type='text' data={detail.properties['幼獣・成獣']} />
      <InfoDiv title='性別' type='text' data={detail.properties.性別} />
      <InfoDiv title='体長' type='number' data={detail.properties.体長} unit='cm' />
      <InfoDiv
        title='体重（体長から自動計算）'
        type='number'
        data={detail.properties.体重}
        unit='kg'
      />
      {pregnantInfo}
      <InfoDiv title='処分方法' type='text' data={detail.properties.処分方法} />
      <InfoDiv title='備考（遠沈管番号）' type='text' data={detail.properties.備考} />
    </div>
  );
};

export default BoarInfov1View;
