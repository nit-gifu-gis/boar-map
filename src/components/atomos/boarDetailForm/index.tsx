import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { BoarInfoFeatureV2, BoarInfoPropsV2 } from '../../../types/features';
import {
  fetchTraderList,
  filterListByArea,
  getTraderByName,
  includeTrader,
} from '../../../utils/jibie';
import { checkDateError, checkNumberError } from '../../../utils/validateData';
import InfoDiv from '../../molecules/infoDiv';
import InfoInput from '../../molecules/infoInput';
import { BoarDetailFormHandler, BoarDetailFormProps, TraderInfo, TraderList } from './interface';

const BoarDetailForm = React.forwardRef<BoarDetailFormHandler, BoarDetailFormProps>(
  function InfoForm(props, ref) {
    const {currentUser} = useCurrentUser(); 

    const featureValueOrUndefined = (key: keyof BoarInfoPropsV2): string | undefined => {
      if (props.detail == null) return undefined;

      if (props.detail.properties[key as keyof BoarInfoPropsV2] != null) {
        return props.detail.properties[key];
      }
      return undefined;
    };

    const [isFemale, setFemale] = useState(featureValueOrUndefined('性別') === 'メス');
    const [isAdult, setAdult] = useState(
      featureValueOrUndefined('体長') != null
        ? parseInt(featureValueOrUndefined('体長') as string) >= 91
        : false,
    );
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [disposalValue, setDisposalValue] = useState<string | undefined>(
      featureValueOrUndefined('処分方法'),
    );
    const [traderList, setTraderList] = useState<TraderList | null | boolean>(null);

    const updateError = (id: string, value: string | undefined) => {
      setErrors((err) => {
        const e = { ...err };
        e[id] = value;
        return e;
      });
    };

    const [area, setArea] = useState<string>(
      props.detail != null &&
        props.detail.properties['地域'] != null &&
        props.detail.properties['地域'] != ''
        ? props.detail.properties['地域']
        : props.myTraderInfo != null && props.myTraderInfo.area
          ? props.myTraderInfo.area
          : ' ',
    );

    const [trader, setTrader] = useState<TraderInfo | null | boolean>(
      props.detail != null &&
        props.detail.properties['ジビエ業者'] != null &&
        props.detail.properties['地域'] != null
        ? true
        : props.myTraderInfo != null && props.myTraderInfo.info
          ? props.myTraderInfo.info
          : null,
    );

    const getForm = (): HTMLFormElement => {
      return document.getElementById('form-' + props.formKey) as HTMLFormElement;
    };

    const validateData = () => {
      let valid = validateLength();
      valid = valid && validatePCR();
      valid = valid && validateTrader();
      Object.keys(errors).forEach((key) => {
        if (errors[key] != null) {
          console.error(errors[key]);
          valid = false;
        }
      });
      return valid;
    };

    const validateTrader = () => {
      const form = getForm();
      const disposal = form.disposal.options[form.disposal.selectedIndex].value;

      // ジビエ利用ではない場合には終了する。
      if (disposal !== '利活用（ジビエ利用）' && disposal !== 'ジビエ業者渡し') {
        updateError('trader', undefined);
        return true;
      }

      // リストをエリアでフィルターして、要素が存在しない場合は選択されていない
      const filteredList = filterListByArea(
        traderList && traderList !== true ? traderList : undefined,
        area,
      );
      if (!filteredList.length) {
        updateError('trader', '選択されていません。');
        return false;
      }

      if (trader === null || trader === false || trader === true) {
        setTrader(filteredList[0]);
      }
      updateError('trader', undefined);
      return true;
    };

    const onChangeSex = () => {
      const select = getForm().sex;
      const sex = select.options[select.selectedIndex].value;
      setFemale(sex === 'メス');
    };

    const fetchData = () => {
      // フォーム
      const form = getForm();
      // 成獣幼獣別
      const age = isAdult ? '成獣' : '幼獣';
      // 性別
      const gender = form.sex.options[form.sex.selectedIndex].value;
      // 妊娠の状況
      const pregnant =
        !isFemale || !isAdult ? '' : form.pregnant.options[form.pregnant.selectedIndex].value;
      // 備考
      const note = form.note.value;

      // 遠沈管番号
      const enchinkan = form.enchinkan.value;

      // 体長
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: next-line
      const length = form.length.value;

      // 処分方法
      let disposal = form.disposal.options[form.disposal.selectedIndex].value;
      if (disposal === '利活用（ジビエ利用）') {
        disposal = 'ジビエ業者渡し';
      }

      // (ジビエ利用の場合はこれがtrueになる。)
      const isJibie = disposal === '利活用（ジビエ利用）' || disposal === 'ジビエ業者渡し';
      // 地域
      let jibieArea = '';
      if (isJibie && trader && trader !== true) {
        jibieArea = trader.area as string;
      }

      // 業者
      let jibieTrader = '';
      if (isJibie && trader && trader !== true) {
        jibieTrader = trader.name;
      }

      // PCR日
      const pcr_date = form.pcr_date.value as string;

      // PCR結果
      const pcr_res = form.pcr_result.options[form.pcr_result.selectedIndex].value as string;

      const data: BoarInfoFeatureV2 = {
        properties: {
          成獣幼獣別: age,
          性別: gender,
          体長: `${parseInt(length)}`,
          体重: `${calcWeight(length)}`,
          処分方法: disposal,
          備考: note,
          妊娠の状況: pregnant,
          地域: jibieArea,
          ジビエ業者: jibieTrader,
          遠沈管番号: enchinkan,
          個体管理番: props.detail?.properties.個体管理番 != null ? props.detail.properties.個体管理番 : "",
          情報番号: props.detail?.properties.情報番号 != null ? props.detail.properties.情報番号 : "",
          枝番: '',
          PCR検査日: pcr_date,
          PCR結果: pcr_res,
        },
        geometry: {
          type: 'Point',
          coordinates: [props.location.lng, props.location.lat],
        },
        type: 'Feature',
      };

      // 既存の更新の場合はID$を設定する
      if(props.detail?.properties.ID$ != null) {
        data.properties.ID$ = props.detail?.properties.ID$;
      }

      return data;
    };

    const calcWeight = (length: number) => {
      if (length < 35) {
        return 5;
      } else if (length < 55) {
        return 10;
      } else if (length < 91) {
        return 20; // 幼獣
      } else if (length < 95) {
        return 20; // 成獣
      } else if (length < 105) {
        return 30;
      } else if (length < 115) {
        return 45;
      } else if (length < 125) {
        return 60;
      } else if (length < 135) {
        return 80;
      } else if (length < 145) {
        return 100;
      } else {
        return 130;
      }
    };

    const validatePCR = (): boolean => {
      const form = getForm();
      const dateStr = form['pcr_date'].value;
      const error = checkDateError(dateStr);
      console.error(error);
      if (error != null && error != '日付が入力されていません。') {
        updateError('pcr_date', error);
        return false;
      }
      updateError('pcr_date', undefined);
      return true;
    };

    const setType = (type: string) => {
      const form = getForm();
      form.disposal.selectedIndex = Object.keys(form.disposal.options)
        .map((v) => form.disposal.options[v].value)
        .indexOf(type);
      setDisposalValue(type);
    };

    const setDead = () => {
      setType('―');
    };

    const validateLength = () => {
      const form = getForm();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: next-line
      const length = form.length.value as string;
      const error = checkNumberError(length);
      if (error != null) {
        updateError('length', error);
        return false;
      }
      const lengthNum = parseFloat(length);
      if (lengthNum <= 0) {
        updateError('length', '0以下の数値が入力されています。');
        return false;
      }
      setAdult(parseInt(length) >= 91);
      updateError('length', undefined);
      return true;
    };

    const onChangeDispose = () => {
      const form = getForm();
      const disposal = form.disposal.options[form.disposal.selectedIndex].value as string;
      setDisposalValue(disposal);
      if (props.is_first && props.onFirstDisposeChanged != null) {
        props.onFirstDisposeChanged(disposal);
      }
    };

    useEffect(() => {
      if (props.is_dead) setDead();

      if (featureValueOrUndefined('体長')) validateLength();
    }, []);

    useImperativeHandle(ref, () => {
      return { validateData, fetchData, setType, is_first: props.is_first, setDead };
    });

    const validatePregnant = () => {
      if (!isFemale) {
        // メスじゃない場合はエラーを消して終了
        updateError('pregnant', undefined);
        return;
      }
      // メスの場合
      if (!isAdult) {
        // 成獣じゃない場合はエラーを消して終了
        updateError('pregnant', undefined);
        return;
      }
      // メスかつ成獣の場合
      const form = getForm();
      const pregnant = form.pregnant.options[form.pregnant.selectedIndex].value;
      // 値が選択肢に引っかかればOK
      const options = ['あり', 'なし', '不明'];
      let valid = false;
      for (let i = 0; i < options.length; i++) {
        if (pregnant === options[i]) {
          valid = true;
          break;
        }
      }
      if (valid) {
        updateError('pregnant', undefined);
      } else {
        updateError('pregnant', '選択されていません。');
      }
      return;
    };

    const onChangeArea = () => {
      const areaSelect = getForm().area.value;
      setArea(areaSelect);
    };

    const onChangeTrader = async () => {
      const traderSelect = getForm().trader.value;
      setTrader(await getTraderByName(traderSelect));
    };

    useEffect(() => {
      if (!traderList || traderList === true) return;
      if (trader === true || trader === false) return;

      const filtered = filterListByArea(traderList, area);
      if (!includeTrader(filtered, trader as TraderInfo) && filtered.length) {
        setTrader(filtered[0]);
      }
    }, [area]);

    if (disposalValue === '' || disposalValue == undefined) {
      setDisposalValue(props.detail != null ? props.detail.properties.処分方法 : '埋却');
    }

    if (area === '') {
      setArea(
        props.detail != null &&
          props.detail.properties.地域 != null &&
          props.detail.properties.地域 !== ''
          ? props.detail.properties.地域
          : '',
      );
    }

    useEffect(() => {
      if (props.detail != null && trader === true) {
        getTraderByName(
          props.detail.properties['ジビエ業者'],
          props.detail.properties['地域'],
        ).then((tr) => {
          setTrader(tr);
        });
        return;
      }
    }, [trader]);

    if (!traderList) {
      setTraderList(true);
      fetchTraderList().then((list) => {
        setTraderList(list);
      });
    }

    const filteredList = filterListByArea(
      traderList && traderList !== true ? traderList : undefined,
      area,
    );

    const filteredNameList = filteredList.map((v) => v.name);

    const areaList2 = (traderList && traderList !== true ? traderList.area : []).concat();
    areaList2.unshift(' ');

    return (
      <div>
        <form id={'form-' + props.formKey}>
          <InfoInput
            title='体長 (cm)'
            type='number'
            id='length'
            min={1}
            defaultValue={featureValueOrUndefined('体長')}
            required={true}
            onChange={validateLength}
            error={errors.length}
          />
          <InfoDiv title='幼獣・成獣の別' type='text' data={isAdult ? '成獣' : '幼獣'} />
          <InfoInput
            title='性別'
            type='select'
            id='sex'
            options={['オス', 'メス', '不明']}
            defaultValue={props.detail != null ? props.detail.properties.性別 : '不明'}
            onChange={onChangeSex}
          />
          <div style={{ display: isAdult && isFemale ? 'block' : 'none' }}>
            <InfoInput
              title='妊娠の状況'
              type='select'
              id='pregnant'
              options={['なし', 'あり', '不明']}
              required={true}
              defaultValue={featureValueOrUndefined('妊娠の状況')}
              error={errors.pregnant}
              onChange={validatePregnant}
            />
          </div>
          <InfoInput
            title='遠沈管番号'
            type='text'
            id='enchinkan'
            defaultValue={featureValueOrUndefined('遠沈管番号')}
          />
          <InfoInput
            title='処分方法'
            type='select'
            id='disposal'
            options={['埋却', '焼却', '自家消費', 'ジビエ業者渡し', 'その他（備考に記入）', '―']}
            onChange={onChangeDispose}
            defaultValue={props.detail != null ? props.detail.properties.処分方法 : '埋却'}
          />
          <div
            style={{
              display:
                disposalValue === '利活用（ジビエ利用）' || disposalValue === 'ジビエ業者渡し'
                  ? 'block'
                  : 'none',
            }}
          >
            <InfoInput
              title='地域（圏域）'
              type='select'
              id='area'
              options={areaList2}
              defaultValue={
                props.detail != null
                  ? props.detail.properties.地域
                  : props.myTraderInfo != null && props.myTraderInfo.area
                    ? props.myTraderInfo.area
                    : ''
              }
              onChange={onChangeArea}
            />

            <InfoInput
              title='ジビエ業者'
              type='select'
              id='trader'
              options={filteredNameList}
              defaultValue={
                props.detail != null
                  ? props.detail.properties.ジビエ業者
                  : props.myTraderInfo != null && props.myTraderInfo.info
                    ? props.myTraderInfo.info.name
                    : filteredNameList.length
                      ? filteredNameList[0]
                      : ''
              }
              error={errors.trader}
              onChange={onChangeTrader}
            />

            {props.detail?.properties.個体管理番 != null && props.detail?.properties.個体管理番 != "" ? (
              <InfoDiv
                title="個体管理番号"
                type="text"
                data={props.detail?.properties.個体管理番}
              />
            ) : <></>}
          </div>
          <div
            style={{ display: currentUser?.userDepartment == "K" || currentUser?.userDepartment == "D" ? "block" : "none" }}
          >
            <InfoInput
              title='PCR検査日'
              type='date'
              defaultValue={featureValueOrUndefined('PCR検査日')}
              id='pcr_date'
              onChange={validatePCR}
              error={errors.pcr_date}
            />
            <InfoInput
              title='PCR検査結果'
              type='select'
              options={['', '陽性', '陰性']}
              defaultValue={featureValueOrUndefined('PCR結果')}
              id='pcr_result'
            />
          </div>
          <InfoInput
            title='備考'
            type='textarea'
            rows={4}
            id='note'
            defaultValue={featureValueOrUndefined('備考')}
          />
        </form>
      </div>
    );
  },
);

export default BoarDetailForm;
