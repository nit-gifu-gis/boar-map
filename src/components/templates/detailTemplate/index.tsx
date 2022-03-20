import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { FeatureBase } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { hasWritePermission, LayerType, toServerType } from '../../../utils/gis';
import { alert, confirm } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import FeatureViewer from '../../organisms/featureViewer';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';
import { HeaderColor } from '../../organisms/header/interface';

const DetailTemplate: React.FunctionComponent = () => {
  const router = useRouter();
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

  const to_header_color = (val: string): HeaderColor => {
    switch (val) {
      case 'boar-1':
        return 'boar';
      case 'boar-2':
        return 'boar';
      case 'trap':
        return 'trap';
      case 'vaccine':
        return 'vaccine';
      case 'report':
        return 'report';
      case 'butanetsu':
        return 'butanetsu';
      case 'youton':
        return 'youton';
      default:
        return 'primary';
    }
  };

  const to_header_title = (val: string | null): string => {
    switch (val) {
      case 'boar-1':
        return '捕獲情報';
      case 'boar-2':
        return '捕獲情報';
      case 'trap':
        return 'わな情報';
      case 'vaccine':
        return 'ワクチン情報';
      case 'report':
        return '作業日報';
      case 'butanetsu':
        return '豚熱感染情報';
      case 'youton':
        return '養豚場情報';
      default:
        return '情報確認';
    }
  };

  const onClickDelete = async () => {
    if (featureInfo == null) return;
    setEditable(false);
    if (await confirm('この情報を削除します。\n本当によろしいですか？')) {
      // 画像の削除用関数の準備
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
            imageIds.push(sid);
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
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                };
                fetch(`${SERVER_URI}/Image/DeleteImage.php`, options)
                  .then((res) => {
                    if (res.status === 200) {
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
        const res = await fetch(SERVER_URI + '/Features/DeleteFeatures', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
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

  const onClickEdit = () => {
    if (featureInfo == null) return;

    router.push(
      {
        pathname: '/edit',
        query: {
          id: router.query.id as string,
          type: featureType,
          detail: JSON.stringify(featureInfo),
        },
      },
      '/edit',
    );
  };

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
