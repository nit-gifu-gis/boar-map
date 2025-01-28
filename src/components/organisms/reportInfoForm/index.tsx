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
import WorkDetailInput from '../../atomos/workDetailInput';
import ReportBInput from '../../atomos/reportBInput';

const ReportInfoForm = React.forwardRef<FeatureEditorHandler, ReportInfoFormProps>(
  function InfoForm(props, ref) {
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const { currentUser } = useCurrentUser();

    const [branchList, setBranchList] = useState(['（上を選択してください。）']);
    const [nameList, setNameList] = useState(['（上を選択してください。）']);

    const fetchData = () => {
      const form = document.getElementById('form-report') as HTMLFormElement;
      const area = form.area.options[form.area.selectedIndex].value as string;
      // const branch = form.branch.options[form.branch.selectedIndex].value as string;
      const branch = form.branch.value as string;
      const name = form.person_name.value as string;
      // const name = form.person_name.options[form.person_name.selectedIndex].value as string;
      const time_start = (document.getElementById('worktime_start') as HTMLInputElement)
        .value as string;
      const time_end = (document.getElementById('worktime_end') as HTMLInputElement)
        .value as string;
      const report = form.report.value as string;
      const note = form.note.value as string;

      const city = (document.getElementById('city') as HTMLInputElement).value as string;
      const vaccine_no = (document.getElementById('vaccine_no') as HTMLInputElement).value as string;

      // 作業内容の組み立て
      const workdetail_placed = (document.getElementById('workdetail_placed') as HTMLInputElement).value;
      const workdetail_removed = (document.getElementById('workdetail_removed') as HTMLInputElement).value;

      const workdetail_crawl = (document.getElementById('workdetail_crawl') as HTMLInputElement).checked;
      const workdetail_capture = (document.getElementById('workdetail_capture') as HTMLInputElement).checked;

      const workdetail_own = workdetail_capture ? (document.getElementById('workdetail_own') as HTMLInputElement).checked : false;
      const workdetail_help = workdetail_capture ? (document.getElementById('workdetail_help') as HTMLInputElement).checked : false;
      const workdetail_mistake = workdetail_capture ? (document.getElementById('workdetail_mistake') as HTMLInputElement).checked : false;

      const workdetail = `${workdetail_placed}/${workdetail_removed}/${workdetail_crawl ? '見回り' : ''}/${workdetail_capture ? '捕獲' : ''}\n${workdetail_own ? '自身のわな' : ''}/${workdetail_help ? '捕獲手伝い' : ''}/${workdetail_mistake ? '錯誤捕獲' : ''}`;

      // 錯誤捕獲の組み立て

      const workdetail_trap_type = workdetail_mistake ? (document.getElementById('workdetail_trap_type') as HTMLInputElement).value : '';
      const workdetail_head_count = workdetail_mistake ? (document.getElementById('workdetail_head') as HTMLInputElement).value : '';
      const workdetail_response = workdetail_mistake ? (document.getElementById('workdetail_response') as HTMLInputElement).value : '';

      const workdetail_deer = workdetail_mistake ? (document.getElementById('workdetail_deer') as HTMLInputElement).checked : false;
      const workdetail_serow = workdetail_mistake ? (document.getElementById('workdetail_serow') as HTMLInputElement).checked : false;
      const workdetail_boar = workdetail_mistake ? (document.getElementById('workdetail_boar') as HTMLInputElement).checked : false;
      const workdetail_other = workdetail_mistake ? (document.getElementById('workdetail_other') as HTMLInputElement).checked : false;
      
      const workdetail_other_animal = workdetail_other ? (document.getElementById('workdetail_other_animal') as HTMLInputElement).value : '';

      const workdetail_mistake_str = `${workdetail_trap_type}\n${workdetail_head_count}\n${workdetail_response}\n${workdetail_deer ? 'ニホンジカ' : ''}/${workdetail_serow ? 'カモシカ' : ''}/${workdetail_boar ? 'ツキノワグマ' : ''}/${workdetail_other ? 'その他' : ''}\n${workdetail_other ? workdetail_other_animal : ''}`;

      const helper = (document.getElementById('report_b_helper') as HTMLInputElement).value;
      
      // とめさし道具の組み立て
      const tool_elec = (document.getElementById('report_b_elec') as HTMLInputElement).checked;
      const tool_gun = (document.getElementById('report_b_gun') as HTMLInputElement).checked;
      const tool_other = (document.getElementById('report_b_other') as HTMLInputElement).checked;

      const tool_other_content = tool_other ? (document.getElementById('report_b_other_tool') as HTMLInputElement).value : "";

      const tool_str = `${tool_elec ? '電気とめさし器' : ''}/${tool_gun ? '銃' : ''}/${tool_other ? 'その他' : ''}\n${tool_other_content}`;

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
          錯誤捕獲: workdetail_mistake_str,
          止刺道具: tool_str,
          捕獲補助: helper,
          作業内容: workdetail,
          ワクチンNO: vaccine_no,
          市町村字: city
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
      // const branch = form.branch.options[form.branch.selectedIndex].value as string;
      const branch = form.branch.value as string;
      const name = form.person_name.value as string;
      // const name = form.person_name.options[form.person_name.selectedIndex].value as string;
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
        updateError('branch', '入力されていません');
      }

      if (name == '' || name == '（上を選択してください。）') {
        valid = false;
        updateError('person_name', '入力されていません');
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

        /* // 支部名のリストを取得
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

        form.person_name.selectedIndex = nameList.indexOf(props.featureInfo.properties.氏名); */
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
            title="所属支部名"
            id="branch"
            type='text'
            required={true}
            error={errors.branch}
            defaultValue={featureValueOrUndefined('所属支部名')}
          />
          <InfoInput
            title='氏名'
            id='person_name'
            type='text'
            required={true}
            error={errors.person_name}
            defaultValue={featureValueOrUndefined('氏名')}
          />
          {/*<InfoInput
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
          />*/}
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
          <WorkDetailInput
            id='workdetail'
            workDefaultValue={featureValueOrUndefined('作業内容')}
            mistakeDefaultValue={featureValueOrUndefined('錯誤捕獲')}
            error={errors.workdetail}
          />
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
          <ReportBInput
            id='report_b'
            error={errors.report_b}
            toolDefaultValue={featureValueOrUndefined('止刺道具')}
            helperDefaultValue={featureValueOrUndefined('捕獲補助')}
          />
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
