import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { BoarFeaturePropsV2, BoarFeatureV2, BoarInfoFeatureV2 } from '../../../types/features';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { fetchTraderInfo } from '../../../utils/jibie';
import { makeRandStr } from '../../../utils/randStr';
import { checkDateError } from '../../../utils/validateData';
import BoarDetailForm from '../../atomos/boarDetailForm';
import { BoarDetailFormHandler, MyTraderInfo } from '../../atomos/boarDetailForm/interface';
import Divider from '../../atomos/divider';
import InfoDiv from '../../molecules/infoDiv';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { BoarFormRef, BoarInfov2FormProps } from './interface';

const BoarInfov2Form = React.forwardRef<FeatureEditorHandler, BoarInfov2FormProps>(
  function InfoForm(props, ref) {
    const [boarFormList, setBoarFormList] = useState<BoarFormRef[] | null>(null);
    const [, setHiddenBoarFormList] = useState<BoarFormRef[]>([]);
    const [myTraderInfo, setMyTraderInfo] = useState<MyTraderInfo | undefined | null>(undefined);
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const { currentUser } = useCurrentUser();

    const featureValueOrUndefined = (key: keyof BoarFeaturePropsV2): string | undefined => {
      if (props.featureInfo == null) return undefined;

      if (key === '捕獲いのしし情報') return undefined;

      if (props.featureInfo.properties[key as keyof BoarFeaturePropsV2] != null) {
        return props.featureInfo.properties[key];
      }
      return undefined;
    };

    useEffect(() => {
      const mounted = async () => {
        // ジビエ業者の場合、その情報を取得
        let myTraderInfo = null;
        if (currentUser?.userDepartment === 'J') {
          myTraderInfo = await fetchTraderInfo();
          setMyTraderInfo(myTraderInfo);
        } else {
          setMyTraderInfo(null);
        }
      };
      mounted();
    }, []);

    useEffect(() => {
      if (myTraderInfo === undefined) return;

      // データのセットアップ
      if (props.featureInfo != null && props.featureInfo.properties.捕獲いのしし情報 != null) {
        // detailがある場合はそれで生成
        const data = props.featureInfo.properties.捕獲いのしし情報;
        const details = [];
        for (let i = 0; i < data.length; i++) {
          const r = React.createRef<BoarDetailFormHandler>();
          const key = makeRandStr(10);
          details.push({
            ref: r,
            obj: (
              <BoarDetailForm
                ref={r}
                detail={data[i]}
                key={key}
                formKey={key}
                myTraderInfo={myTraderInfo}
                is_first={i == 0}
                is_dead={isEnv}
                formRefs={boarFormList == null ? [] : boarFormList}
                location={props.location}
                onFirstDisposeChanged={onFirstDisposeChanged}
              />
            ),
          });
        }
        setBoarFormList(details);
      } else {
        // ない場合は生成
        const r = React.createRef<BoarDetailFormHandler>();
        const key = makeRandStr(10);
        setBoarFormList([
          {
            ref: r,
            obj: (
              <BoarDetailForm
                location={props.location}
                ref={r}
                key={key}
                formKey={key}
                myTraderInfo={myTraderInfo}
                is_first={true}
                is_dead={isEnv}
                formRefs={boarFormList == null ? [] : boarFormList}
                onFirstDisposeChanged={onFirstDisposeChanged}
              />
            ),
          },
        ]);
      }
    }, [myTraderInfo]);

    const onFirstDisposeChanged = (t: string) => {
      setBoarFormList((boarList) => {
        if (boarList != null) {
          boarList.forEach((r) => {
            if (!r.ref.current?.is_first) r.ref.current?.setType(t);
          });
        }
        setHiddenBoarFormList([]);
        return boarList;
      });
    };

    const [isEnv, setEnv] = useState(featureValueOrUndefined('区分') === '死亡');
    const [isMultiple, setMultiple] = useState(
      featureValueOrUndefined('罠発見場所') == '箱わな' ||
        featureValueOrUndefined('罠発見場所') == '囲いわな',
    );

    const fetchData = async () => {
      const boarListData = await new Promise<BoarInfoFeatureV2[]>((resolve) => {
        setBoarFormList((boarList) => {
          const asyncFunc = async () => {
            const list: BoarInfoFeatureV2[] = [];
            if (boarList != null) {
              for (let i = 0; i < boarList.length; i++) {
                const data = await boarList[i].ref.current?.fetchData();
                if (data != null && data != undefined) {
                  list.push(data as BoarInfoFeatureV2);
                }
              }
            }
            resolve(list);
          };
          asyncFunc();
          return boarList;
        });
      });

      const form = getForm();
      // 入力者
      const user =
        props.featureInfo?.properties.入力者 != null
          ? props.featureInfo.properties.入力者
          : currentUser?.userId;
      // 区分
      const division = form.division.options[form.division.selectedIndex].value as string;
      // 市町村
      const city = await getCityName();
      // 捕獲年月日
      const dateStr = form.date.value;
      // 捕獲頭数
      const catchNum = !isMultiple || isEnv ? 1 : parseInt(form['catchNum'].value);
      // 罠・発見場所
      let trapOrEnv = '';
      if (isEnv) {
        trapOrEnv = form.env.options[form.env.selectedIndex].value as string;
      } else {
        trapOrEnv = form.trap.options[form.trap.selectedIndex].value as string;
      }

      const data: BoarFeatureV2 = {
        properties: {
          入力者: user,
          メッシュ番: "",
          区分: division,
          市町村: city,
          捕獲年月日: dateStr,
          捕獲頭数: `${catchNum}`,
          罠発見場所: trapOrEnv,
          地名: '',
          処理方法: '',
          写真ID:
            props.featureInfo?.properties.写真ID != null
              ? props.featureInfo?.properties.写真ID
              : '',
          歯列写真ID:
            props.featureInfo?.properties.歯列写真ID != null
              ? props.featureInfo?.properties.歯列写真ID
              : '',
          捕獲いのしし情報: boarListData,
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

      return data;
    };

    const getCityName = async () => {
      const body = {
        geometry: {
          type: 'Point',
          coordinates: [[props.location.lng, props.location.lat]],
        },
      };

      const res = await fetch(SERVER_URI + '/Features/GetCity', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify(body),
      });

      if (res.status === 200) {
        const json = await res.json();
        const features = json['features'];
        if (features != null && features.length !== 0) {
          return features[0]['properties']['NAME'];
        } else {
          return '';
        }
      } else {
        return '';
      }
    };

    const getForm = () => {
      return document.getElementById('form-boar2') as HTMLFormElement;
    };

    const validateData = async () => {
      let valid = validateMeshNo();
      valid = valid && validateDate();
      valid = valid && validateCatchNum();
      await new Promise<void>((resolve) => {
        setBoarFormList((boarList) => {
          if (boarList != null) {
            for (let i = 0; i < boarList.length; i++) {
              if (
                boarList[i] != null &&
                boarList[i].ref != null &&
                boarList[i].ref.current != null
              ) {
                const prom = boarList[i].ref.current?.validateData();
                if (prom != null) valid = valid && prom;
              }
            }
          }
          resolve();
          return boarList;
        });
      });
      return valid;
    };

    const updateError = (id: string, value: string | undefined) => {
      setErrors((err) => {
        const e = { ...err };
        e[id] = value;
        return e;
      });
    };

    const validateMeshNo = () => {
      const form = getForm();
      const meshNo = form.meshNo.value as string;
      if (meshNo === '') {
        updateError('meshNo', '入力されていません。');
        return false;
      }
      updateError('meshNo', undefined);
      return true;
    };

    const onChangeDivision = () => {
      const form = getForm();
      const division = form.division.options[form.division.selectedIndex].value as string;
      setEnv(division === '死亡');
      setBoarFormList((boarList) => {
        if (boarList != null && division === '死亡' && boarList.length != 0) {
          // 自動で処分方法を - に変更
          boarList[0].ref.current?.setDead();
        }
        return boarList;
      });
      generateBoarInputForm();
    };

    const onChangeTrap = () => {
      const form = getForm();
      const division = form.trap.options[form.trap.selectedIndex].value as string;
      setMultiple(division === '箱わな' || division === '囲いわな');
    };

    const validateDate = () => {
      const form = getForm();
      const dateStr = form.date.value;
      const error = checkDateError(dateStr);
      if (error != null) {
        updateError('date', error);
        return false;
      }
      updateError('date', undefined);
      return true;
    };

    const validateCatchNum = (): boolean => {
      if (!isMultiple || isEnv) {
        // 箱わなが選択されていない場合はnull
        updateError('catchNum', undefined);
        return true;
      }

      const form = getForm();
      const catchNum = !isMultiple || isEnv ? 1 : parseInt(form['catchNum'].value);
      if (catchNum <= 0) {
        updateError('catchNum', '捕獲頭数が0以下です。');
        return false;
      } else if (catchNum >= 21) {
        updateError('catchNum', '捕獲頭数が21以上です。');
        return false;
      } else {
        updateError('catchNum', undefined);
      }
      generateBoarInputForm();
      return true;
    };

    const generateBoarInputForm = () => {
      if (myTraderInfo === undefined) return;

      const form = getForm();
      const catchNum = !isMultiple || isEnv ? 1 : parseInt(form['catchNum'].value);
      if (Number.isNaN(catchNum) || catchNum <= 0) {
        return;
      }

      // useStateのsetXXXの更新タイミングがわからないので、こういう風にやると確実に最新の値を使えるらしい。
      setBoarFormList((boarList) => {
        if (boarList === null) {
          return null;
        }

        if (boarList.length == catchNum) {
          // 数が変わらないので何もしない
          return boarList;
        }
        const newDetails = boarList.slice();
        setHiddenBoarFormList((hiddenList) => {
          // 配列のコピー
          const newHiddens = hiddenList.slice();

          // detailにhiddenから追加するか新規に生成するか
          // (数の入力途中に消えないようにいい感じに)
          while (newDetails.length < catchNum) {
            if (newHiddens.length > 0) {
              // hiddensから取り出し
              newDetails.push(newHiddens.shift() as BoarFormRef);
            } else {
              // 新規追加
              const r = React.createRef<BoarDetailFormHandler>();
              const key = makeRandStr(10);
              newDetails.push({
                ref: r,
                obj: (
                  <BoarDetailForm
                    location={props.location}
                    ref={r}
                    key={key}
                    formKey={key}
                    myTraderInfo={myTraderInfo}
                    is_first={false}
                    is_dead={isEnv}
                    formRefs={boarFormList == null ? [] : boarFormList}
                    onFirstDisposeChanged={onFirstDisposeChanged}
                  />
                ),
              });
            }
          }

          // detailからhiddenに移動
          while (newDetails.length > catchNum) {
            newHiddens.unshift(newDetails.pop() as BoarFormRef);
          }
          return newHiddens;
        });
        return newDetails;
      });

      return true;
    };

    useEffect(() => {
      generateBoarInputForm();
    }, [myTraderInfo]);

    useEffect(() => {
      generateBoarInputForm();
    }, [isMultiple, isEnv]);

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    return (
      <div className='w-full'>
        <form id='form-boar2' onSubmit={(e) => e.preventDefault()}>
          <InfoDiv
            title='画像'
            type='images'
            data={{
              objectURLs: props.objectURLs == null ? [] : props.objectURLs.map((p) => p.objectURL),
              imageIDs: props.imageIds == null ? [] : props.imageIds,
              confirmMode: true,
            }}
          />
          <InfoInput
            title='区分'
            type='select'
            id='division'
            options={['調査捕獲', '有害捕獲', '死亡', '狩猟', 'その他']}
            onChange={onChangeDivision}
            defaultValue={featureValueOrUndefined('区分')}
          />
          <InfoInput
            title='捕獲年月日'
            type='date'
            id='date'
            defaultValue={featureValueOrUndefined('捕獲年月日')}
            onChange={validateDate}
            error={errors.date}
            required={true}
          />
          <div style={{ display: !isEnv ? 'none' : 'block' }}>
            <InfoInput
              title='発見場所'
              type='select'
              id='env'
              options={['山際', '山地', 'その他']}
              defaultValue={featureValueOrUndefined('罠発見場所')}
            />
          </div>
          <div style={{ display: isEnv ? 'none' : 'block' }}>
            <InfoInput
              title='わなの種類'
              type='select'
              id='trap'
              options={['くくりわな', '箱わな', '囲いわな', '銃猟', 'その他']}
              defaultValue={featureValueOrUndefined('罠発見場所')}
              onChange={onChangeTrap}
            />
          </div>
          <div style={{ display: !isEnv && isMultiple ? 'block' : 'none' }}>
            <InfoInput
              title='捕獲頭数'
              type='number'
              id='catchNum'
              min={0}
              required={true}
              defaultValue={featureValueOrUndefined('捕獲頭数')}
              onChange={validateCatchNum}
              error={errors.catchNum}
            />
            <p className='boar-form__description'>
              ※以下に捕獲した個体の情報について入力してください。
            </p>
          </div>
        </form>
        {myTraderInfo !== undefined && boarFormList != null ? (
          boarFormList.map((v, index) => (
            <div key={'boarform-' + (index + 1)}>
              {index > 0 ? <Divider /> : <></>}
              {boarFormList.length > 1 ? (
                <div className='w-full p-[15px] text-justify text-2xl font-bold text-text'>
                  {index + 1}体目
                </div>
              ) : (
                <></>
              )}
              {v.obj}
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    );
  },
);

export default BoarInfov2Form;
