/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { TrapProps, FeatureBase, TrapFeature } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { yesNo } from '../../../utils/modal';
import { sortFeatures } from '../../../utils/sort';
import RoundButton from '../../atomos/roundButton';
import { TrapTableProps } from './interface';

const TrapTable: React.FunctionComponent<TrapTableProps> = (p) => {
  const router = useRouter();
  const [sortKey, setSortKey] = useState('ID$');
  const [isDesc, setDesc] = useState(false);
  const [features, setFeatures] = useState<FeatureBase[]>([]);

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

  useEffect(() => {
    const features = p.features.slice();
    setFeatures(sortFeatures(sortKey, features as TrapFeature[], isDesc));
  }, [sortKey, isDesc]);

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
    if (yesNoCheck) {
      router.push(
        {
          pathname: '/edit/location',
          query: {
            id: id,
            type: 'わな設置地点',
            type_srv: `trap`,
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
            type: 'わな設置地点',
            type_srv: `trap`,
            detail: JSON.stringify(feature),
            version: 1,
          },
        },
        '/edit/image',
      );
    }
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
