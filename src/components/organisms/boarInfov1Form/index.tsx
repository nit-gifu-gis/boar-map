import React, { useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { BoarFeatureV1, BoarPropsV1, FeatureBase } from '../../../types/features';
import { checkDateError, checkNumberError } from '../../../utils/validateData';
import InfoDiv from '../../molecules/infoDiv';
import InfoInput from '../../molecules/infoInput';
import { FeatureEditorHandler } from '../featureEditor/interface';
import { BoarInfov1FormProps } from './interface';

const BoarInfov1Form = React.forwardRef<FeatureEditorHandler, BoarInfov1FormProps>(
  function InfoForm(props, ref) {
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const { currentUser } = useCurrentUser();

    const fetchData = () => {
      const form = getForm();
      // 送信に必要な情報を集めておく
      // 0 入力者
      const user = props.featureInfo?.properties.入力者 != null ? props.featureInfo.properties.入力者 : currentUser?.userId;
      // 0-1 メッシュ番号
      const meshNo = form.meshNo.value;
      // 1 区分
      const division = form.division.options[form.division.selectedIndex].value;
      // 2 捕獲年月日
      const date = form.date.value;
      // // 3 位置情報
      const lat = props.location.lat;
      const lng = props.location.lng;
      // 4 わなor発見場所
      let trapOrEnv;
      switch (division) {
        case "死亡":
          trapOrEnv = form.env.options[form.env.selectedIndex].value;
          break;
        default:
          trapOrEnv = form.trap.options[form.trap.selectedIndex].value;
          break;
      }
      // 4-0-1 捕獲頭数
      let catchNum = 0;
      let childrenNum = "";
      let adultsNum = "";
      if (isBox) {
        childrenNum = `${parseInt(form.childrenNum.value)}`;
        adultsNum = `${parseInt(form.adultsNum.value)}`;
        catchNum = parseInt(childrenNum) + parseInt(adultsNum);
      }
      // 4-1 幼獣・成獣の別
      const age = form.age.options[form.age.selectedIndex].value;
      if (!isBox) {
        catchNum = 1;
        childrenNum = `${age === "幼獣" ? 1 : 0}`;
        adultsNum = `${age === "成獣" ? 1 : 0}`;
      }
      // 5 性別
      const sex = form.sex.options[form.sex.selectedIndex].value;
      // 6 体長
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: next-line
      const length = form.length.value;
      // 6-1 妊娠の状況
      let pregnant = "";
      if (isFemale && isAdult) {
        pregnant = form.pregnant.options[form.pregnant.selectedIndex].value;
      }
      // 6-2 処分方法
      const disposal = form.disposal.options[form.disposal.selectedIndex].value;
      // 7 体重
      const weight = toWeight(Number(length));
      // 7-1 備考
      const note = form.note.value;
      // 8 歯列画像
      // 9 現地写真
 
      const data: BoarFeatureV1 = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        properties: {
          入力者: user,
          メッシュ番号: meshNo,
          区分: division,
          捕獲年月日: date,
          位置情報: "(" + lat + "," + lng + ")",
          "罠・発見場所": trapOrEnv,
          捕獲頭数: `${catchNum}`,
          幼獣の頭数: childrenNum,
          成獣の頭数: adultsNum,
          "幼獣・成獣": age,
          性別: sex,
          体長: length,
          体重: `${weight}`,
          妊娠の状況: pregnant,
          処分方法: disposal,
          備考: note,
          歯列写真: '',
          現地写真: '',
          画像ID: props.featureInfo?.properties.画像ID != null ? props.featureInfo.properties.画像ID : ""
        }
      };

      // 既存の更新の場合はID$を設定する
      if(props.featureInfo?.properties.ID$ != null) {
        data.properties.ID$ = props.featureInfo?.properties.ID$;
      }

      return new Promise<FeatureBase>((resolve) => resolve(data));
    };

    const validateData = () => {
      let valid = validateMeshNo();
      valid = valid && validateDate();
      valid = valid && validateLength();
      valid = valid && validatePregnant();
      valid = valid && validateEachCatchNum("childrenNum");
      valid = valid && validateEachCatchNum("adultsNum");
      valid = valid && validateCatchNum();
      return new Promise<boolean>((resolve) => resolve(valid));
    };

    const updateError = (id: string, value: string | undefined) => {
      setErrors((err) => {
        const e = { ...err };
        e[id] = value;
        return e;
      });
    };

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    const featureValueOrUndefined = (key: keyof BoarPropsV1): string | undefined => {
      if (props.featureInfo == null) return undefined;

      if (props.featureInfo.properties[key as keyof BoarPropsV1] != null) {
        return props.featureInfo.properties[key];
      }
      return undefined;
    };

    const [isBox, setBox] = useState(featureValueOrUndefined("罠・発見場所") === "箱わな");
    const [isFemale, setFemale] = useState(featureValueOrUndefined("性別") === "メス");
    const [isAdult, setAdult] = useState(featureValueOrUndefined("幼獣・成獣") === "成獣");
    const [isEnv, setEnv] = useState(featureValueOrUndefined("区分") === "死亡");

    const getForm = () => {
      return document.getElementById('form-boar-old') as HTMLFormElement;
    };

    const validateMeshNo = (): boolean => {
      const form = getForm();
      const meshNo = form.meshNo.value;
      // データが無いならエラー
      if (meshNo === "") {
        updateError("meshNo", "入力されていません。");
        return false;
      } else {
        updateError("meshNo", undefined);
        return true;
      }
    };

    const onChangeDivision = () => {
      const divisonSelect = getForm().division;
      const division = divisonSelect.options[divisonSelect.selectedIndex].value;
      if(division === "死亡") {
        setBox(false);
        setEnv(true);
      } else {
        setEnv(false);
      }
    };

    const validateDate = (): boolean => {
      const form = getForm();
      const dateStr = form.date.value;
      const error = checkDateError(dateStr);
      if (error != null) {
        updateError("date", error);
        return false;
      }
      updateError("date", undefined);
      return true;
    };

    const onChangeAge = () => {
      const ageSelect = getForm().age;
      const age = ageSelect.options[ageSelect.selectedIndex].value;
      setAdult(age === "成獣");
    };

    const onChangeSex = () => {
      const sexSelect = getForm().sex;
      const sex = sexSelect.options[sexSelect.selectedIndex].value;
      setFemale(sex === "メス");
    };

    const validateLength = (): boolean => {
      const form = getForm();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: next-line
      const length = form.length.value;
      const error = checkNumberError(length);
      if (error != null) {
        updateError("length", error);
        return false;
      }
      const length_num = parseFloat(length);
      if (length_num <= 0) {
        updateError("length", "0以下の数値が入力されています。");
        return false;
      }
      updateError("length", undefined);
      return true;
    };

    const validatePregnant = (): boolean => {
      if (!isFemale) {
        // メスじゃない場合はエラーを消して終了
        updateError("pregnant", undefined);
        return true;
      }
      // メスの場合
      if (!isAdult) {
        // 成獣じゃない場合はエラーを消して終了
        updateError("pregnant", undefined);
        return true;
      }
      // メスかつ成獣の場合
      const form = getForm();
      const pregnant = form.pregnant.options[form.pregnant.selectedIndex].value;
      // 値が選択肢に引っかかればOK
      const options = ["あり", "なし", "不明"];
      let valid = false;
      for (let i = 0; i < options.length; i++) {
        if (pregnant === options[i]) {
          valid = true;
          break;
        }
      }
      if (valid) {
        updateError("pregnant", undefined);
      } else {
        updateError("pregnant", "選択されていません。");
        return false;
      }
      return true;
    };

    const validateEachCatchNum = (name: string): boolean => {
    // 捕獲頭数の個々の数を検証
      if (!isBox) {
      // 箱わなが選択されていない場合はnull
        updateError(name, undefined);
        return true;
      }

      const form = getForm();
      const numStr = form[name].value;
      const error = checkNumberError(numStr);
      if (error != null) {
        updateError(name, error);
        return false;
      }

      // 0以上か検証
      const num = parseFloat(numStr);
      if (num < 0) {
        updateError(name, "負の数が入力されています。");
        return false;
      }

      // それ以外ならエラーなし
      updateError(name, undefined);
      return true;
    };

    const validateCatchNum = (): boolean => {
      if (!isBox) {
        // 箱わなが選択されていない場合はnull
        updateError("childrenNum", undefined);
        updateError("adultsNum", undefined);
        return true;
      }
      // すでにエラーがある場合は検証しない
      const cError = validateEachCatchNum("childrenNum");
      const aError = validateEachCatchNum("adultsNum");
      if (!cError || !aError) {
        return false;
      }
      // 足す
      const form = getForm();
      const childrenNum = parseInt(form["childrenNum"].value);
      const adultsNum = parseInt(form["adultsNum"].value);
      const catchNum = childrenNum + adultsNum;
      if (catchNum <= 0) {
        updateError("childrenNum", "捕獲頭数の合計が0以下です。");
        updateError("adultsNum", "捕獲頭数の合計が0以下です。");
        return false;
      }

      return true;
    };

    const onChangeTrap = () => {
      const trapSelect = getForm().trap;
      const trap = trapSelect.options[trapSelect.selectedIndex].value;
      setBox(trap === "箱わな");
    };

    const toWeight = (length: number) => {
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

    return (
      <div className='w-full'>
        <form id='form-boar-old' onSubmit={(e) => e.preventDefault()}>
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
            title="メッシュ番号"
            type="mesh-num"
            id="meshNo"
            defaultValue={featureValueOrUndefined("メッシュ番号")}
            lat={props.location.lat}
            lng={props.location.lng}
            required={true}
            onChange={validateMeshNo}
            error={errors.meshNo}
          />
          <InfoInput
            title="区分"
            type="select"
            id="division"
            options={["調査捕獲", "有害捕獲", "死亡", "狩猟", "その他"]}
            onChange={onChangeDivision}
            defaultValue={featureValueOrUndefined("区分")}
          />
          <InfoInput
            title="捕獲年月日"
            type="date"
            id="date"
            defaultValue={featureValueOrUndefined("捕獲年月日")}
            onChange={validateDate}
            error={errors.date}
            required={true}
          />
          <div style={{ display: isEnv ? 'block' : 'none'}}>
            <InfoInput
              title="発見場所"
              type="select"
              id="env"
              options={["山際", "山地", "その他"]}
              defaultValue={featureValueOrUndefined("罠・発見場所")}
            />
          </div>
          <div style={{ display: !isEnv ? 'block' : 'none'}}>
            <InfoInput
              title="わなの種類"
              type="select"
              id="trap"
              options={["くくりわな", "箱わな", "その他"]}
              defaultValue={featureValueOrUndefined("罠・発見場所")}
              onChange={onChangeTrap}
            />
          </div>
          <div style={{ display: isBox ? 'block' : 'none'}}>
            <InfoInput
              title="幼獣の頭数"
              type="number"
              id="childrenNum"
              min={0}
              required={true}
              defaultValue={featureValueOrUndefined("幼獣の頭数")}
              onChange={() => validateEachCatchNum("childrenNum")}
              error={errors.childrenNum}
            />
            <InfoInput
              title="成獣の頭数"
              type="number"
              id="adultsNum"
              min={0}
              required={true}
              defaultValue={featureValueOrUndefined("成獣の頭数")}
              onChange={() => validateEachCatchNum("adultsNum")}
              error={errors.adultsNum}
            />
            <p className="boar-form__description">
            ※以下の項目については、血液を採取した個体の情報を入力してください。
            </p>
          </div>
          <InfoInput
            title="幼獣・成獣の別"
            type="select"
            id="age"
            options={["幼獣", "成獣"]}
            defaultValue={featureValueOrUndefined("幼獣・成獣") === undefined ? "幼獣" : featureValueOrUndefined("幼獣・成獣")}
            onChange={onChangeAge}
          />
          <InfoInput
            title="性別"
            type="select"
            id="sex"
            options={["オス", "メス", "不明"]}
            defaultValue={featureValueOrUndefined("性別") === undefined ? "不明" : featureValueOrUndefined("性別")}
            onChange={onChangeSex}
          />
          <InfoInput
            title="体長 (cm)"
            type="number"
            id="length"
            min={1}
            defaultValue={featureValueOrUndefined("体長")}
            required={true}
            onChange={validateLength}
            error={errors.length}
          />
          <div style={{ display: isFemale && isAdult ? 'block' : 'none'}}>
            <InfoInput
              title="妊娠の状況"
              type="select"
              id="pregnant"
              options={["なし", "あり", "不明"]}
              required={true}
              defaultValue={featureValueOrUndefined("妊娠の状況")}
              error={errors.pregnant}
              onChange={validatePregnant}
            />
          </div>
          <InfoInput
            title="処分方法"
            type="select"
            id="disposal"
            options={["埋設", "焼却", "家保", "利活用", "その他"]}
            defaultValue={featureValueOrUndefined("処分方法") === undefined ? "埋設" : featureValueOrUndefined("処分方法")}
          />
          <InfoInput
            title="備考（遠沈管番号）（作業時間）"
            type="textarea"
            rows={4}
            id="note"
            defaultValue={featureValueOrUndefined("備考")}
          />
        </form>
      </div>
    );
  },
);

export default BoarInfov1Form;
