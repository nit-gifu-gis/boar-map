/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useState } from 'react';

import { ButanetsuProps, FeatureBase, ButanetsuFeature } from '@/types/features';

import RoundButton from '@/components/atomos/roundButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SERVER_URI } from '@/utils/constants';
import { getAccessToken } from '@/utils/currentUser';
import { useFormDataParser } from '@/utils/form-data';
import { hasWritePermission } from '@/utils/gis';
import { alert, yesNo } from '@/utils/modal';
import { sortFeatures } from '@/utils/sort';

export interface ButanetsuTableProps {
  features: FeatureBase[];
}

const ButanetsuTable: React.FunctionComponent<ButanetsuTableProps> = (p) => {
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
    const features = p.features.filter((v) => {
      return !deletedFeatures.includes((v as ButanetsuFeature).properties.ID$ as string);
    });

    setFeatures(sortFeatures(sortKey, features as ButanetsuFeature[], isDesc));
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

  const sort = (key: keyof ButanetsuProps) => {
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
      dataType: 'butanetsu',
      isLocationSkipped: !yesNoCheck,
      isImageSkipped: true,
      inputData: {
        gisData: feature,
      },
      editData: {
        id: id as string,
        type: '豚熱陽性確認情報',
        type_srv: `butanetsu`,
        version: `1`,
        curImg: {
          teeth: [],
          other: [],
        },
      },
    });

    if (yesNoCheck) {
      router.push('/edit/location');
    } else {
      router.push('/edit/info');
    }
  };

  const onClickDelete = async (id: string | undefined, feature: FeatureBase) => {
    if (!(await confirm(`ID: ${id}の情報を削除しますか？`))) return;

    const type = 'butanetsu';

    setEditable(false);

    const body = {
      type: type,
      shapeIds: [id as string],
    };
    try {
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
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('県番号')
              }
              onClick={() => sort('県番号')}
            >
              県番号
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('捕獲場所')
              }
              onClick={() => sort('捕獲場所')}
            >
              捕獲場所
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('性別')
              }
              onClick={() => sort('性別')}
            >
              性別
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('体長')
              }
              onClick={() => sort('体長')}
            >
              体長
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('遠沈管番号')
              }
              onClick={() => sort('遠沈管番号')}
            >
              遠沈管
              <br />
              番号
            </th>
            <th
              className={
                'border border-b-2 border-solid border-border p-1 ' + sortableClass('更新日')
              }
              onClick={() => sort('更新日')}
            >
              最終
              <br />
              更新日
            </th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as ButanetsuProps;
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
                <td className='border border-solid border-border p-1'>{props.捕獲年月日}</td>
                <td className='border border-solid border-border p-1'>{props.県番号}</td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.捕獲場所}
                </td>
                <td className='border border-solid border-border p-1 text-right'>{props.性別}</td>
                <td className='border border-solid border-border p-1'>
                  {props.体長}
                </td>
                <td className='border border-solid border-border p-1 text-right'>
                  {props.遠沈管番号}
                </td>
                <td className='border border-solid border-border p-1 text-right'>{props.更新日}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ButanetsuTable;
