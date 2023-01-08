import { useCurrentUser } from '../../../hooks/useCurrentUser';
import Divider from '../../atomos/divider';
import InfoDiv from '../../molecules/infoDiv';
import { BoarInfov2ViewProps } from './interface';

const BoarInfov2View: React.FunctionComponent<BoarInfov2ViewProps> = ({
  detail,
  objectURLs,
  imageIDs,
  confirmMode,
}) => {
  // 箱わな/囲いわなが選択されたときのみ捕獲頭数を表示
  const { currentUser } = useCurrentUser();
  let catchNumInfo: JSX.Element | null = null;
  if (detail.properties.罠発見場所 === '箱わな' || detail.properties.罠発見場所 === '囲いわな') {
    let childrenNum = 0;
    let adultsNum = 0;
    detail.properties.捕獲いのしし情報.forEach((v) => {
      if (v.properties.成獣幼獣別 === '成獣') adultsNum++;
      else childrenNum++;
    });

    catchNumInfo = (
      <InfoDiv
        title='捕獲頭数'
        type='text'
        data={`${detail.properties.捕獲頭数}（幼獣: ${childrenNum} 成獣: ${adultsNum}）`}
      />
    );
  }

  const getImgIDs = () => {
    if (imageIDs != null) {
      return imageIDs;
    } else {
      const d = detail.properties.写真ID.split(',');
      d.unshift(detail.properties.歯列写真ID);
      return d.filter((e) => e);
    }
  };

  return (
    <div className='box-border w-full pb-2'>
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
          imageIDs: getImgIDs(),
        }}
      />
      <InfoDiv title='メッシュ番号' type='text' data={detail.properties.メッシュ番} />
      <InfoDiv title='区分' type='text' data={detail.properties.区分} />
      <InfoDiv title='捕獲年月日' type='date' data={detail.properties.捕獲年月日} />
      <InfoDiv title='わな・発見場所' type='text' data={detail.properties.罠発見場所} />
      {catchNumInfo}
      {detail.properties.捕獲いのしし情報.length === 0 ? (
        <InfoDiv title='個体情報' type='gray' data={'取得に失敗しました。'} />
      ) : (
        detail.properties.捕獲いのしし情報.map((v, index, arr) => {
          return (
            <div key={v.properties.ID$}>
              {index > 0 ? <Divider /> : <></>}
              {arr.length > 1 ? (
                <div className='align-justify w-full p-[15px] text-2xl font-bold text-text'>
                  <div>{index + 1}体目</div>
                </div>
              ) : (
                <></>
              )}
              <InfoDiv title='幼獣・成獣の別' type='text' data={v.properties.成獣幼獣別} />
              <InfoDiv title='性別' type='text' data={v.properties.性別} />
              <InfoDiv title='体長' type='number' data={v.properties.体長} unit='cm' />
              <InfoDiv
                title='体重（体長から自動計算）'
                type='number'
                data={v.properties.体重}
                unit='kg'
              />
              {v.properties.性別 === 'メス' && v.properties.成獣幼獣別 === '成獣' ? (
                <InfoDiv title='妊娠の状況' type='text' data={v.properties.妊娠の状況} />
              ) : (
                <></>
              )}
              <InfoDiv title='遠沈管番号' type='text' data={v.properties.遠沈管番号} />
              <InfoDiv title='処分方法' type='text' data={v.properties.処分方法} />
              {v.properties.処分方法 === '利活用（ジビエ利用）' ||
              v.properties.処分方法 === 'ジビエ業者渡し' ? (
                <>
                  <InfoDiv title='地域（圏域）' type='text' data={v.properties.地域} />
                  <InfoDiv title='ジビエ業者' type='text' data={v.properties.ジビエ業者} />
                  <InfoDiv
                    title='個体管理番号'
                    type='text'
                    data={
                      v.properties.個体管理番 == ''
                        ? confirmMode
                          ? '（登録時に確定します）'
                          : '（未入力）'
                        : v.properties.個体管理番.replace('-', '')
                    }
                  />
                </>
              ) : (
                <></>
              )}
              {confirmMode &&
              !(currentUser?.userDepartment == 'K' || currentUser?.userDepartment == 'D') ? (
                <></>
              ) : (
                <>
                  {v.properties.PCR検査日 == '' ? (
                    <InfoDiv title='PCR検査日' type='text' data={'（未入力）'} />
                  ) : (
                    <InfoDiv title='PCR検査日' type='date' data={v.properties.PCR検査日} />
                  )}
                  <InfoDiv
                    title='PCR検査結果'
                    type='text'
                    data={v.properties.PCR結果 == '' ? '（未入力）' : v.properties.PCR結果}
                  />
                </>
              )}
              <InfoDiv title='備考' type='text' data={v.properties.備考} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default BoarInfov2View;
