/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { TrapProps, FeatureBase, TrapFeature } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { hasWritePermission } from '../../../utils/gis';
import { alert, yesNo } from '../../../utils/modal';
import { sortFeatures } from '../../../utils/sort';
import RoundButton from '../../atomos/roundButton';
import { TrapTableProps } from './interface';
import { useFormDataParser } from '../../../utils/form-data';

const TrapTable: React.FunctionComponent<TrapTableProps> = (p) => {
  const router = useRouter();
  const paramParser = useFormDataParser();
  const { currentUser } = useCurrentUser();
  const [sortKey, setSortKey] = useState('ID$');
  const [isDesc, setDesc] = useState(false);
  const [features, setFeatures] = useState<FeatureBase[]>([]);
  const [editable, setEditable] = useState(false);
  const [deletedFeatures, setDeletedFeatures] = useState<string[]>([]);

  const sortableClass = (key: string) => {
    if (key == sortKey) {
      if (isDesc) {
        return 'sortable desc';
      } else {
        return 'sortable asc';
      }
    }
    return 'sortable';
  };

  const updateTable = () => {
    const features = p.features.filter(v=>{
      return !deletedFeatures.includes((v as TrapFeature).properties.ID$ as string);
    });

    setFeatures(sortFeatures(sortKey, features as TrapFeature[], isDesc));
  };

  useEffect(() => {
    updateTable();
  }, [sortKey, isDesc]);

  useEffect(() => {
    setDeletedFeatures([]);
  }, p.features);

  useEffect(() => {
    setEditable(currentUser != null ? hasWritePermission('boar', currentUser) : false);
  }, [currentUser]);

  const sort = (key: keyof TrapProps) => {
    if (key == sortKey) {
      setDesc((b) => !b);
    } else {
      setSortKey(key);
      setDesc(false);
    }
  };

  const onClickEdit = async (id: string | undefined, feature: FeatureBase) => {
    if (!id) return;

    const yesNoCheck = await yesNo('位置情報の編集を行いますか？');
    paramParser.updateData({
      dataType: 'trap',
      isLocationSkipped: !yesNoCheck,
      isImageSkipped: false,
      inputData: {
        gisData: feature,
      },
      editData: {
        id: id as string,
        type: 'わな設置地点',
        type_srv: `trap`,
        version: `1`,
        curImg: {
          teeth: ((feature.properties as Record<string, string>)['歯列写真ID'] || '').split(','),
          other: ((feature.properties as Record<string, string>)['画像ID'] || '').split(','),
        }
      }
    });
    
    if (yesNoCheck) {
      router.push('/edit/location');
    } else {
      router.push('/edit/image');
    }
  };

  const onClickDelete = async (id: string | undefined, feature: FeatureBase) => {
    if(!await confirm(`ID: ${id}の情報を削除しますか？`))
      return;

    const type = "trap";

    setEditable(false);
    // 画像の削除用関数の準備
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let deleteImage = (id: string) => new Promise<void>((resolve) => resolve());
    let imageIds: string[] = [];

    imageIds = ((feature.properties as Record<string, unknown>)['画像ID'] as string).split(
      ',',
    );

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

    // GISにクエリを投げる
    const body = {
      type: type,
      shapeIds: [id as string],
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
        
        deletedFeatures.push(`${id}`);
        updateTable();
      } else {
        const json = await res.json();
        await alert(json['reason']);
      }
    } catch (e) {
      await alert(`${e}`);
    }

    setEditable(currentUser != null ? hasWritePermission('boar', currentUser) : false);
  };

  return (
    <div className=''>
      <table className='block border-collapse whitespace-pre'>
        <tbody className='table'>
          <tr>
            <th className={'border border-b-2 border-solid border-border p-1'}></th>
            <th
              className={'border border-b-2 border-solid border-border p-1 ' + sortableClass('ID$')}
              onClick={() => sort('ID$')}
            >
              ID$
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('入力者')
              }
              onClick={() => sort('入力者')}
            >
              入力者
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('罠の種類')
              }
              onClick={() => sort('罠の種類')}
            >
              罠の種類
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('設置年月日')
              }
              onClick={() => sort('設置年月日')}
            >
              設置
              <br />
              年月日
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('撤去年月日')
              }
              onClick={() => sort('撤去年月日')}
            >
              撤去
              <br />
              年月日
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('更新日')
              }
              onClick={() => sort('更新日')}
            >
              最終<br />更新日
            </th>
            <th className={'border border-b-2 border-solid border-border p-1 '}>備考</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>写真</th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as TrapProps;
            const imageList = props.画像ID.split(',').filter((e) => e);
            return (
              <tr key={'data-' + (i + 1) + '-trap'}>
                <td className='border border-solid border-border p-1 text-right'>
                  <RoundButton color='accent' onClick={() => onClickEdit(props.ID$, f)}>
                    編集
                  </RoundButton>
                  <div className='mt-2'>
                    <RoundButton
                      color='danger'
                      disabled={!editable}
                      onClick={() => onClickDelete(props.ID$, f)}
                    >
                        削除
                    </RoundButton>
                  </div>
                </td>
                <td className='border border-solid border-border p-1 text-right'>{props.ID$}</td>
                <td className='border border-solid border-border p-1'>{props.入力者}</td>
                <td className='border border-solid border-border p-1'>{props.罠の種類}</td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.設置年月日}
                </td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.撤去年月日}
                </td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.更新日}
                </td>
                <td className='border border-solid border-border p-1'>{props.備考}</td>

                <td className='border border-solid border-border p-1'>
                  <div className='flex w-[650px] flex-wrap'>
                    {imageList.length == 0 ? (
                      <div>画像なし</div>
                    ) : (
                      imageList
                        .filter((e) => e)
                        .map((v, img_i) => {
                          const url = `${SERVER_URI}/Image/GetImage?id=${v}&token=${getAccessToken()}`;

                          // 200px x 200pxでエリアを確保しておき、ロード後に長辺200pxになるようにリサイズする
                          const onLoaded = (e: SyntheticEvent<HTMLImageElement>) => {
                            const elem = e.target as HTMLImageElement;

                            const calcShort = (long: number, short: number) => {
                              return short * (200.0 / long);
                            };

                            const w =
                              elem.naturalWidth > elem.naturalHeight
                                ? 200
                                : calcShort(elem.naturalHeight, elem.naturalWidth);
                            const h =
                              elem.naturalWidth > elem.naturalHeight
                                ? calcShort(elem.naturalWidth, elem.naturalHeight)
                                : 200;
                            elem.setAttribute('style', `width: ${w}px; height: ${h}px;`);
                          };

                          return (
                            <a
                              href={url}
                              rel='noopener noreferrer'
                              target='_blank'
                              key={'Image_' + (img_i + 1) + '_' + props.ID$}
                            >
                              <img
                                src={url}
                                alt={'Image ' + (img_i + 1) + ' of ID ' + props.ID$}
                                className='m-[5px] max-w-none'
                                style={{ width: '200px', height: '200px' }}
                                onLoad={onLoaded}
                              />
                            </a>
                          );
                        })
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrapTable;
