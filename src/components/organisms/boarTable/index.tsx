/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import {
  BoarCommonPropsV2,
  BoarFeaturePropsV2,
  BoarFeatureV2,
  BoarInfoPropsV2,
  FeatureBase,
} from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { hasWritePermission } from '../../../utils/gis';
import { alert, yesNo } from '../../../utils/modal';
import { sortFeatures } from '../../../utils/sort';
import RoundButton from '../../atomos/roundButton';
import { BoarTableProps } from './interface';
import { useFormDataParser } from '../../../utils/form-data';

const BoarTable: React.FunctionComponent<BoarTableProps> = (p) => {
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
      const k = `${(v as BoarFeatureV2).version}-${(v as BoarFeatureV2).properties.ID$}`;
      return !deletedFeatures.includes(k);
    });

    setFeatures(sortFeatures(sortKey, features as BoarFeatureV2[], isDesc));
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

  const sort = (
    key: keyof BoarInfoPropsV2 | keyof BoarCommonPropsV2 | '幼獣の頭数' | '成獣の頭数' | "検体到着日" | "捕獲者",
  ) => {
    if (key == sortKey) {
      setDesc((b) => !b);
    } else {
      setSortKey(key);
      setDesc(false);
    }
  };

  const onClickEdit = async (
    id: string | undefined,
    version: number | undefined,
    feature: FeatureBase,
  ) => {
    if (!id && !version) return;
    
    const yesNoCheck = await yesNo('位置情報の編集を行いますか？\n\n※ 検体到着予定日以降に修正する場合は、下記にご連絡ください。\nTel. 058-272-8096 (平日8:30～12:00、13:00～17:15)');
    paramParser.updateData({
      dataType: 'boar',
      isLocationSkipped: !yesNoCheck,
      isImageSkipped: false,
      inputData: {
        gisData: feature,
      },
      editData: {
        id: id as string,
        type: 'いのしし捕獲地点',
        type_srv: `boar-${version}`,
        version: `${version}`,
        curImg: {
          teeth: ((feature.properties as Record<string, string>)['歯列写真ID'] || '').split(','),
          other: ((feature.properties as Record<string, string>)[`boar-${version}` === 'boar-2' ? '写真ID' : '画像ID'] || '').split(','),
        }
      }
    });
    
    if (yesNoCheck) {
      router.push('/edit/location');
    } else {
      router.push('/edit/image');
    }
  };

  const onClickDelete = async (
    id: string | undefined,
    version: number | undefined,
    feature: FeatureBase,
  ) => {
    if(!await confirm(`ID: ${id}の情報を削除しますか？`))
      return;
    
    setEditable(false);
    const type = `boar-${version}`;
   
    // 画像の削除用関数の準備
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let deleteImage = (id: string) => new Promise<void>((resolve) => resolve());
    let imageIds: string[] = [];

    const idKey = type === 'boar-2' ? '写真ID' : '画像ID'; // 新レイヤーの時のみ写真IDになる。
    imageIds = ((feature.properties as Record<string, unknown>)[idKey] as string).split(
      ',',
    );
    // 新レイヤーの場合のみ歯列写真IDという名前も確認する。
    if (type === 'boar-2') {
      const sid = (feature.properties as Record<string, unknown>)['歯列写真ID'] as string;
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

        deletedFeatures.push(`${version}-${id}`);
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
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('区分')
              }
              onClick={() => sort('区分')}
            >
              区分
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('捕獲年月日')
              }
              onClick={() => sort('捕獲年月日')}
            >
              捕獲
              <br />
              年月日
            </th>
            <th 
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('検体到着日')
              }
              onClick={() => sort('検体到着日')}
            >
              検体到着<br />予定日
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('罠発見場所')
              }
              onClick={() => sort('罠発見場所')}
            >
              わなの種類
              <br />
              発見場所
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('捕獲頭数')
              }
              onClick={() => sort('捕獲頭数')}
            >
              頭数
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('幼獣の頭数')
              }
              onClick={() => sort('幼獣の頭数')}
            >
              幼獣の
              <br />
              頭数
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('成獣の頭数')
              }
              onClick={() => sort('成獣の頭数')}
            >
              成獣の
              <br />
              頭数
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('捕獲者')
              }
              onClick={() => sort('捕獲者')}
            >
              捕獲者
            </th>
            <th className={'border border-b-2 border-solid border-border p-1'}>枝番</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>
              幼獣
              <br />
              成獣
            </th>
            <th className={'border border-b-2 border-solid border-border p-1'}>性別</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>
              妊娠の
              <br />
              状況
            </th>
            <th className={'border border-b-2 border-solid border-border p-1'}>体長</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>
              処分
              <br />
              方法
            </th>
            <th className={'border border-b-2 border-solid border-border p-1'}>遠沈管番号</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>{p.noteLabel}</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>ジビエ業者</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>個体管理番号</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>PCR検査日</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>PCR検査結果</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>確認番号</th>
            <th className={'border border-b-2 border-solid border-border p-1'}>写真</th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as BoarFeaturePropsV2;
            const imageList = [...props.歯列写真ID.split(','), ...props.写真ID.split(',')].filter((e) => e);
            return props.捕獲いのしし情報.map((_, index, arr) => {
              const d = arr[index].properties;
              return (
                <tr key={'data-' + (i + 1) + '-boar-' + (index + 1)}>
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      <RoundButton
                        color='accent'
                        onClick={() => onClickEdit(props.ID$, (f as BoarFeatureV2).version, f)}
                      >
                        編集
                      </RoundButton><br />
                      <div className='mt-2'>
                        <RoundButton
                          color='danger'
                          disabled={!editable}
                          onClick={() => onClickDelete(props.ID$, (f as BoarFeatureV2).version, f)}
                        >
                        削除
                        </RoundButton>
                      </div>
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {props.ID$}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td className='border border-solid border-border p-1' rowSpan={arr.length}>
                      {props.入力者}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td className='border border-solid border-border p-1' rowSpan={arr.length}>
                      {props.区分}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {props.捕獲年月日}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {props.検体到着日}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td className='border border-solid border-border p-1' rowSpan={arr.length}>
                      {props.罠発見場所}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {props.捕獲頭数}
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {
                        props.捕獲いのしし情報.filter((v) => v.properties.成獣幼獣別 == '幼獣')
                          .length
                      }
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {
                        props.捕獲いのしし情報.filter((v) => v.properties.成獣幼獣別 == '成獣')
                          .length
                      }
                    </td>
                  ) : (
                    <></>
                  )}
                  {index == 0 ? (
                    <td
                      className='border border-solid border-border p-1 text-right'
                      rowSpan={arr.length}
                    >
                      {props.捕獲者}
                    </td>
                  ) : (
                    <></>
                  )}
                  <td className='border border-solid border-border p-1 text-right'>
                    {d.枝番 ? d.枝番 : 1}
                  </td>
                  <td className='border border-solid border-border p-1'>{d.成獣幼獣別}</td>
                  <td className='border border-solid border-border p-1'>{d.性別}</td>
                  <td className='border border-solid border-border p-1'>{d.妊娠の状況}</td>
                  <td className='border border-solid border-border p-1 text-right'>{d.体長} cm</td>
                  <td className='border border-solid border-border p-1'>{d.処分方法}</td>
                  <td className='border border-solid border-border p-1 text-right'>
                    {d.遠沈管番号}
                  </td>
                  <td className='border border-solid border-border p-1'>{d.備考}</td>
                  <td className='border border-solid border-border p-1'>{d.ジビエ業者}</td>
                  <td className='border border-solid border-border p-1 text-right'>
                    {d.個体管理番 ? d.個体管理番.replaceAll('-', '') : '(未入力)'}
                  </td>
                  <td className='border border-solid border-border p-1 text-right'>
                    {d.PCR検査日 ? d.PCR検査日 : '(未入力)'}
                  </td>
                  <td className='border border-solid border-border p-1'>
                    {d.PCR結果 ? d.PCR結果 : '(未入力)'}
                  </td>
                  <td className='border border-solid border-border p-1 text-right'>
                    {d.確認番号 ? d.確認番号 : 'なし'}
                  </td>
                  {index == 0 ? (
                    <td className='border border-solid border-border p-1' rowSpan={arr.length}>
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
                  ) : (
                    <></>
                  )}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BoarTable;
