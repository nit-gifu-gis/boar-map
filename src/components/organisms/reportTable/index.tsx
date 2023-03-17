/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { ReportProps, FeatureBase, ReportFeature } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { hasWritePermission } from '../../../utils/gis';
import { alert, yesNo } from '../../../utils/modal';
import { sortFeatures } from '../../../utils/sort';
import RoundButton from '../../atomos/roundButton';
import { ReportTableProps } from './interface';

const ReportTable: React.FunctionComponent<ReportTableProps> = (p) => {
  const router = useRouter();
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
      return !deletedFeatures.includes((v as ReportFeature).properties.ID$ as string);
    });

    setFeatures(sortFeatures(sortKey, features as ReportFeature[], isDesc));
  };

  useEffect(() => {
    setDeletedFeatures([]);
  }, p.features);

  useEffect(() => {
    updateTable();
  }, [sortKey, isDesc]);

  useEffect(() => {
    setEditable(currentUser != null ? hasWritePermission('boar', currentUser) : false);
  }, [currentUser]);

  const sort = (key: keyof ReportProps) => {
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
    if (yesNoCheck) {
      router.push(
        {
          pathname: '/edit/location',
          query: {
            id: id,
            type: '作業日報',
            type_srv: `report`,
            detail: JSON.stringify(feature),
            version: 1,
          },
        },
        '/edit/location',
      );
    } else {
      router.push(
        {
          pathname: '/edit/image',
          query: {
            id: id,
            type: '作業日報',
            type_srv: `report`,
            detail: JSON.stringify(feature),
            version: 1,
          },
        },
        '/edit/image',
      );
    }
  };

  const onClickDelete = async (id: string | undefined, feature: FeatureBase) => {
    if(!await confirm(`ID: ${id}の情報を削除しますか？`))
      return;

    const type = "report";

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
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('地域')
              }
              onClick={() => sort('地域')}
            >
              地域
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('所属支部名')
              }
              onClick={() => sort('所属支部名')}
            >
              所属
              <br />
              支部名
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('氏名')
              }
              onClick={() => sort('氏名')}
            >
              氏名
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('作業開始時')
              }
              onClick={() => sort('作業開始時')}
            >
              作業開始
              <br />
              時刻
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('作業終了時')
              }
              onClick={() => sort('作業終了時')}
            >
              作業終了
              <br />
              時刻
            </th>
            <th className={'border border-b-2 border-solid border-border p-1 '}>
              作業報告
              <br />
              状況報告
            </th>
            <th className={'border border-b-2 border-solid border-border p-1 '}>備考</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>写真</th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as ReportProps;
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
                <td className='border border-solid border-border p-1'>{props.地域}</td>
                <td className='border border-solid border-border p-1'>{props.所属支部名}</td>
                <td className='border border-solid border-border p-1'>{props.氏名}</td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.作業開始時.split(' ')[0]}
                  <br />
                  {props.作業開始時.split(' ')[1]}
                </td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.作業終了時.split(' ')[0]}
                  <br />
                  {props.作業終了時.split(' ')[1]}
                </td>
                <td className='border border-solid border-border p-1'>{props.作業報告}</td>
                <td className='border border-solid border-border p-1'>{props.備考}</td>

                <td className='border border-solid border-border p-1'>
                  <div className='flex w-[300px] flex-wrap'>
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

export default ReportTable;
