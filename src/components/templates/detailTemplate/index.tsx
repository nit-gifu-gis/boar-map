import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { FeatureBase } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { hasWritePermission, LayerType, toServerType } from '../../../utils/gis';
import { to_header_color, to_header_title } from '../../../utils/header';
import { alert, confirm, yesNo } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import FeatureViewer from '../../organisms/featureViewer';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { useFormDataParser } from '../../../utils/form-data';

const DetailTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const paramParser = useFormDataParser();
  const { currentUser } = useCurrentUser();
  const [featureInfo, setFeatureInfo] = useState<FeatureBase | null>(null);
  const [featureType, setFeatureType] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const feature_id = router.query.id as string | undefined;
    const feature_ver = router.query.version as string | undefined; // いのしし捕獲地点の場合のみ
    const feature_type = router.query.type as string | undefined;
    const feature_server_type =
      feature_ver != null && feature_type != null ? toServerType(feature_type, feature_ver) : null;
    if (!feature_id || !feature_type || !feature_server_type || feature_ver == null) {
      router.push('/map');
      return;
    }

    const fetchGis = async () => {
      // GISから情報を取得する。
      const body = {
        type: feature_server_type,
        ids: [feature_id],
      };

      const response = await fetch(SERVER_URI + '/Features/GetFeaturesById', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      if (response.ok && Array.isArray(json) && json.length === 1 && currentUser != null) {
        setFeatureType(feature_server_type);
        setFeatureInfo(json[0] as FeatureBase);

        // 編集可否
        const layerType = (
          feature_server_type.startsWith('boar-') ? 'boar' : feature_server_type
        ) as LayerType;
        setEditable(hasWritePermission(layerType, currentUser));
      } else {
        alert('情報の取得に失敗しました。');
        router.push('/map');
        return;
      }
    };
    fetchGis();
  }, []);

  const onClickDelete = async () => {
    if (featureInfo == null) return;
    setEditable(false);
    if (await confirm('この情報を削除します。\n本当によろしいですか？')) {
      // 画像の削除用関数の準備
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let deleteImage = (id: string) => new Promise<void>((resolve) => resolve());
      let imageIds: string[] = [];
      if (featureType !== 'butanetsu' && featureType !== 'youton') {
        // 養豚場データ/豚熱感染症確認地点データ以外は画像の削除も併せて行う
        const idKey = featureType === 'boar-2' ? '写真ID' : '画像ID'; // 新レイヤーの時のみ写真IDになる。
        imageIds = ((featureInfo.properties as Record<string, unknown>)[idKey] as string).split(
          ',',
        );
        // 新レイヤーの場合のみ歯列写真IDという名前も確認する。
        if (featureType === 'boar-2') {
          const sid = (featureInfo.properties as Record<string, unknown>)['歯列写真ID'] as string;
          if (sid != null && sid !== '') {
            sid.split(',').filter(e=>e).forEach((e) => imageIds.push(e));
          }
        }

        // 画像ファイルが存在する場合のみ関数を定義する。
        if (imageIds.length >= 1 && imageIds[0] != '') {
          deleteImage = (id: string) => {
            return new Promise<void>((resolve, reject) => {
              try {
                const data = new FormData();
                data.append('id', id);
                const options = {
                  method: 'POST',
                  body: data,
                  headers: {
                    Accept: 'application/json',
                    'X-Access-Token': getAccessToken(),
                  },
                };
                fetch(`${SERVER_URI}/Image/DeleteImage`, options)
                  .then((res) => {
                    if (res.status === 200 || res.status === 404) {
                      resolve();
                    } else {
                      return res.json();
                    }
                  })
                  .then((json) => reject(json['reason']))
                  .catch((e) => reject(e));
              } catch (e) {
                reject(e);
              }
            });
          };
        }
      }

      // GISにクエリを投げる
      const body = {
        type: featureType,
        shapeIds: [router.query.id as string],
      };
      try {
        // 先に画像を削除する.
        await Promise.all(imageIds.map((id) => deleteImage(id)));
        const res = await fetch(SERVER_URI + '/Features/DeleteFeature', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Access-Token': getAccessToken(),
          },
          body: JSON.stringify(body),
        });

        if (res.status === 200) {
          await alert('削除しました。');
          router.push('/map');
        } else {
          const json = await res.json();
          await alert(json['reason']);
        }
      } catch (e) {
        await alert(`${e}`);
      }
    }
    setEditable(true);
  };

  const onClickEdit = useCallback(async () => {
    if (featureInfo == null) return;

    const layerType = (
      (featureType ?? '').startsWith('boar-') ? 'boar' : featureType
    ) as LayerType;

    const isImageSkip = layerType === 'report' || layerType === 'butanetsu' || layerType === 'youton'; 

    const yesNoCheck = await yesNo('位置情報の編集を行いますか？\n\n(いのしし捕獲情報のみ)\n※ 検体到着予定日以降に修正する場合は、下記にご連絡ください。\nTel. 058-272-8096 \n(平日8:30～12:00、13:00～17:15)');
    paramParser.updateData({
      dataType: layerType,
      isLocationSkipped: !yesNoCheck,
      isImageSkipped: isImageSkip,
      inputData: {
        gisData: featureInfo,
      },
      editData: {
        id: router.query.id as string,
        type: router.query.type as string,
        type_srv: featureType,
        version: router.query.version as string,
        curImg: {
          teeth: ((featureInfo.properties as Record<string, string>)['歯列写真ID'] || '').split(','),
          other: ((featureInfo.properties as Record<string, string>)[router.query.type_srv === 'boar-2' ? '写真ID' : '画像ID'] || '').split(','),
        }
      }
    });
    
    if (yesNoCheck) {
      router.push('/edit/location');
    } else if(isImageSkip) {
      router.push('/edit/info');
    } else {
      router.push('/edit/image');
    }
  }, [featureInfo, featureType]);

  return (
    <div className=''>
      <Header color={to_header_color(featureType == null ? '' : featureType)}>
        {to_header_title(featureType)}
      </Header>
      <FeatureViewer featureInfo={featureInfo} type={featureType} />
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton color='accent' onClick={() => router.push('/map')}>
            戻る
          </RoundButton>
          <RoundButton color='primary' onClick={onClickEdit.bind(this)} disabled={!editable}>
            編集
          </RoundButton>
          <RoundButton color='danger' onClick={onClickDelete.bind(this)} disabled={!editable}>
            削除
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default DetailTemplate;
