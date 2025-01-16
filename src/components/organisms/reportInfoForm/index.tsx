import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { FeatureBase, ReportFeature, ReportProps } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { checkDateError } from '../../../utils/validateData';
import WorkTimeInput from '../../atomos/workTimeInput';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { ReportInfoFormProps } from './interface';

const ReportInfoForm = React.forwardRef<FeatureEditorHandler, ReportInfoFormProps>(
  function InfoForm(props, ref) {
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const { currentUser } = useCurrentUser();

    const [branchList, setBranchList] = useState(['（上を選択してください。）']);
    const [nameList, setNameList] = useState(['（上を選択してください。）']);

    const fetchData = () => {
      const form = document.getElementById('form-report') as HTMLFormElement;
      const area = form.area.options[form.area.selectedIndex].value as string;
      const branch = form.branch.options[form.branch.selectedIndex].value as string;
      const name = form.person_name.options[form.person_name.selectedIndex].value as string;
      const time_start = (document.getElementById('worktime_start') as HTMLInputElement)
        .value as string;
      const time_end = (document.getElementById('worktime_end') as HTMLInputElement)
        .value as string;
      const report = form.report.value as string;
      const note = form.note.value as string;

      const user =
        props.featureInfo?.properties.入力者 != null
          ? props.featureInfo.properties.入力者
          : currentUser?.userId;
      const data: ReportFeature = {
        properties: {
          入力者: user,
          地域: area,
          所属支部名: branch,
          氏名: name,
          作業開始時: time_start,
          作業終了時: time_end,
          作業報告: report,
          備考: note,
          画像ID: '',
          錯誤捕獲: 'TODO',
          止刺道具: 'TODO',
          捕獲補助: 'TODO',
          作業内容: 'TODO',
          ワクチンNO: 'TODO',
          市町村字: 'TODO'
        },
        geometry: {
          type: 'Point',
          coordinates: [props.location.lng, props.location.lat],
        },
        type: 'Feature',
      };

      // 既存の更新の場合はID$を設定する
      if (props.featureInfo?.properties.ID$ != null) {
        data.properties.ID$ = props.featureInfo?.properties.ID$;
      }
      return new Promise<FeatureBase>((resolve) => resolve(data as FeatureBase));
    };

    const validateData = () => {
      const form = document.getElementById('form-report') as HTMLFormElement;

      const area = form.area.options[form.area.selectedIndex].value as string;
      const branch = form.branch.options[form.branch.selectedIndex].value as string;
      const name = form.person_name.options[form.person_name.selectedIndex].value as string;
      const time_start = (document.getElementById('worktime_start') as HTMLInputElement)
        .value as string;
      const time_end = (document.getElementById('worktime_end') as HTMLInputElement)
        .value as string;
      const report = form.report.value as string;

      let valid = true;
      if (area == '') {
        valid = false;
        updateError('area', '選択されていません');
      }

      if (branch == '' || branch == '（上を選択してください。）') {
        valid = false;
        updateError('branch', '選択されていません');
      }

      if (name == '' || name == '（上を選択してください。）') {
        valid = false;
        updateError('person_name', '選択されていません');
      }

      if (!time_start || !time_end) {
        valid = false;
        updateError('worktime', '入力されていません。');
      }

      const startTime = new Date(time_start);
      const endTime = new Date(time_end);

      const startError = checkDateError(startTime.toDateString());
      const endError = checkDateError(endTime.toDateString());
      if (startError != null) {
        valid = false;
        updateError('worktime', startError);
      }

      if (endError != null) {
        valid = false;
        updateError('worktime', endError);
      }

      if (
        startTime.getHours() > endTime.getHours() ||
        (startTime.getHours() >= endTime.getHours() &&
          startTime.getMinutes() > endTime.getMinutes())
      ) {
        valid = false;
        updateError('worktime', '開始時刻よりも早い終了時刻が入力されています。');
      }

      if (report == '') {
        valid = false;
        updateError('report', '入力されていません');
      }

      return new Promise<boolean>((resolve) => resolve(valid));
    };

    const reportChanged = () => {
      const form = document.getElementById('form-report') as HTMLFormElement;
      const report = form.report.value as string;
      if (report == '') {
        updateError('report', '入力されていません');
      } else {
        updateError('report', undefined);
      }
    };

    const updateError = (id: string, value: string | undefined) => {
      setErrors((err) => {
        const e = { ...err };
        e[id] = value;
        return e;
      });
    };

    useEffect(() => {
      const fetchDefault = async () => {
        if (props.featureInfo == null) return;

        const form = document.getElementById('form-report') as HTMLFormElement;
        // 地域情報が入力されている場合
        if (!props.featureInfo.properties.地域) return;

        form.area.selectedIndex = areaList.indexOf(props.featureInfo.properties.地域);

        // 支部名のリストを取得
        const res = await fetch(
          SERVER_URI +
            '/Report/GetBranches?' +
            new URLSearchParams({ area: props.featureInfo.properties.地域 }),
          {
            method: 'GET',
            headers: {
              'X-Access-Token': getAccessToken(),
            },
          },
        );
        if (res.status !== 200) return;

        const branchList = await res.json();
        setBranchList(branchList);

        // 支部名が入力されている場合
        if (!props.featureInfo.properties.所属支部名) return;

        form.branch.selectedIndex = branchList.indexOf(props.featureInfo.properties.所属支部名);

        // 支部名のリストを取得
        const res2 = await fetch(
          SERVER_URI +
            '/Report/GetNames?' +
            new URLSearchParams({
              area: props.featureInfo.properties.地域,
              branch: props.featureInfo.properties.所属支部名,
            }),
          {
            method: 'GET',
            headers: {
              'X-Access-Token': getAccessToken(),
            },
          },
        );
        if (res2.status !== 200) return;

        const nameList = await res2.json();
        setNameList(nameList);

        if (!props.featureInfo.properties.氏名) return;

        form.person_name.selectedIndex = nameList.indexOf(props.featureInfo.properties.氏名);
      };
      fetchDefault();
    }, []);

    const onChangeArea = async () => {
      updateError('area', undefined);
      const form = document.getElementById('form-report') as HTMLFormElement;
      const area = form.area.options[form.area.selectedIndex].value;
      if (area != '') {
        const res = await fetch(
          SERVER_URI + '/Report/GetBranches?' + new URLSearchParams({ area: area }),
          {
            method: 'GET',
            headers: {
              'X-Access-Token': getAccessToken(),
            },
          },
        );
        if (res.status === 200) {
          const branchList = await res.json();
          setBranchList(branchList);
          setNameList(['（上を選択してください。）']);
          form.branch.selectedIndex = 0;
        }
      } else {
        setBranchList(['（上を選択してください。）']);
        setNameList(['（上を選択してください。）']);
      }
    };

    const onChangeBranch = async () => {
      updateError('branch', undefined);
      const form = document.getElementById('form-report') as HTMLFormElement;
      const area = form.area.options[form.area.selectedIndex].value;
      const branch = form.branch.options[form.branch.selectedIndex].value;
      if (area != '' && branch != '') {
        const res = await fetch(
          SERVER_URI + '/Report/GetNames?' + new URLSearchParams({ area: area, branch: branch }),
          {
            method: 'GET',
            headers: {
              'X-Access-Token': getAccessToken(),
            },
          },
        );
        if (res.status === 200) {
          const nameList = await res.json();
          setNameList(nameList);
          form.person_name.selectedIndex = 0;
        }
      } else if (branch == '') {
        setNameList(['（上を選択してください。）']);
      }
    };

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    const featureValueOrUndefined = (key: keyof ReportProps): string | undefined => {
      if (props.featureInfo == null) return undefined;

      if (props.featureInfo.properties[key as keyof ReportProps] != null) {
        return props.featureInfo.properties[key];
      }
      return undefined;
    };

    const onChangeWorktime = () => {
      updateError('worktime', undefined);
    };

    return (
      <div className='w-full'>
        <form id='form-report' onSubmit={(e) => e.preventDefault()}>
          <InfoInput
            title='地域（農林事務所単位）'
            id='area'
            type='select'
            options={areaList}
            required={true}
            onChange={onChangeArea}
            error={errors.area}
          />
          <InfoInput
            title='所属支部名'
            id='branch'
            type='select'
            options={branchList}
            required={true}
            onChange={onChangeBranch}
            error={errors.branch}
          />
          <InfoInput
            title='氏名'
            id='person_name'
            type='select'
            options={nameList}
            required={true}
            error={errors.person_name}
            onChange={() => updateError('person_name', undefined)}
          />
          <InfoInput
            title='わなの場所'
            subtitle='市町村・字'
            id='city'
            type='text'
            error={errors.city}
            defaultValue={featureValueOrUndefined('市町村字')}
          />
          <InfoInput
            title=''
            subtitle='ワクチンメッシュ番号'
            id='vaccine_no'
            type='text'
            error={errors.vaccine}
            defaultValue={featureValueOrUndefined('ワクチンNO')}
          />
          <WorkTimeInput
            id='worktime'
            onChange={onChangeWorktime}
            defaultStart={featureValueOrUndefined('作業開始時')}
            defaultEnd={featureValueOrUndefined('作業終了時')}
            required={true}
            error={errors.worktime}
          />
          <>ここに作業内容Window</>
          <InfoInput
            title='作業結果・状況報告'
            subtitle='イノシシの痕跡、餌の摂食状況、わな設置場所の検討内容、わなの箇所数・基数、見回り活動で気づいたこと、餌で工夫したこと、改善点などを入力してください。'
            rows={3}
            type='textarea'
            id='report'
            required={true}
            defaultValue={featureValueOrUndefined('作業報告')}
            error={errors.report}
            onChange={() => reportChanged()}
          />
          <>錯誤捕獲</>
          <>ここに作業日報Bについて</>
          <InfoInput
            title='備考'
            rows={3}
            type='textarea'
            id='note'
            defaultValue={featureValueOrUndefined('備考')}
          />
        </form>
      </div>
    );
  },
);

const areaList = [
  '',
  '岐阜',
  '西濃',
  '揖斐',
  '中濃',
  '郡上',
  '可茂',
  '東濃',
  '恵那',
  '下呂',
  '飛騨',
];

export default ReportInfoForm;
