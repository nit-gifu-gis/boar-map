import React, { useImperativeHandle, useState } from "react";
import "./boardetail.scss";
import "../../../public/static/css/global.scss";
import InfoInput from "../../molecules/infoInput";
import {
  BoarDetail,
  BoarDetailFormError,
  BoarDetailFormHandler,
  BoarDetailProps
} from "./interface";
import { deepClone } from "../../../utils/dict";

const BoarDetailForm = React.forwardRef<BoarDetailFormHandler, BoarDetailProps>(
  ({ detail, formKey }, ref) => {
    const [isFemale, setFemale] = useState(
      detail != null ? detail["性別"] === "メス" : false
    );
    const [isAdult, setAdult] = useState(
      detail != null ? detail["成獣幼獣別"] === "成獣" : true
    );
    const [disposalValue, setDisposalValue] = useState<string>("埋却");

    const [error, setError] = useState<BoarDetailFormError>({});

    const checkNumberError = numString => {
      if (numString == "") {
        return "入力されていません。";
      }
      const num = Number(numString);
      if (Number.isNaN(num)) {
        return "数値以外が入力されています。";
      }
      return null;
    };

    const validateLength = async () => {
      const form = document.forms[`form-${formKey}`];
      const length = form.length.value;
      const error = checkNumberError(length);
      if (error != null) {
        await updateError("length", error);
        return;
      }
      const lengthNum = parseFloat(length);
      if (lengthNum <= 0) {
        await updateError("length", "0以下の数値が入力されています。");
        return;
      }
      await updateError("length", null);
    };

    const updateError = async (key: string, message: string) => {
      const e = error;
      e[key] = message;
      setError(deepClone(e));
    };

    // 性別が変更されたときに呼ばれる
    const onChangeSex = () => {
      const sexSelect = document.forms[`form-${formKey}`].sex;
      const sex = sexSelect.options[sexSelect.selectedIndex].value;
      switch (sex) {
        case "メス":
          setFemale(true);
          break;
        default:
          setFemale(false);
          break;
      }
    };

    // 幼獣・成獣の別が変更された時に呼ばれる
    const onChangeAge = () => {
      const ageSelect = document.forms[`form-${formKey}`].age;
      const age = ageSelect.options[ageSelect.selectedIndex].value;
      switch (age) {
        case "成獣":
          setAdult(true);
          break;
        default:
          setAdult(false);
          break;
      }
    };

    const validateData = async (): Promise<boolean> => {
      await validateLength();
      await validatePregnant();
      let valid = true;
      Object.keys(error).forEach(key => {
        if (error[key] != null) {
          console.error(error[key]);
          valid = false;
        }
      });
      return valid;
    };

    const fetchData = (): BoarDetail => {
      // フォーム
      const form = document.forms[`form-${formKey}`];

      // 成獣幼獣別
      const age = form.age.options[form.age.selectedIndex].value;

      // 性別
      const gender = form.sex.options[form.sex.selectedIndex].value;

      // 妊娠の状況
      const pregnant =
        !isFemale || !isAdult
          ? ""
          : form.pregnant.options[form.pregnant.selectedIndex].value;

      // 備考
      const note = form.note.value;

      // 体長
      const length = form.length.value;

      return {
        成獣幼獣別: age,
        性別: gender,
        体長: parseInt(length),
        処分方法: "焼却",
        備考: note,
        妊娠の状況: pregnant
      };
    };

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    const validatePregnant = async () => {
      if (!isFemale) {
        // メスじゃない場合はエラーを消して終了
        await updateError("pregnant", null);
        return;
      }
      // メスの場合
      if (!isAdult) {
        // 成獣じゃない場合はエラーを消して終了
        await updateError("pregnant", null);
        return;
      }
      // メスかつ成獣の場合
      const form = document.forms[`form-${formKey}`].form;
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
        await updateError("pregnant", null);
      } else {
        await updateError("pregnant", "選択されていません。");
      }
      return;
    };

    // 処分方法変更時に呼ばれる。
    const onChangeDispose = () => {
      const disposeSelect = document.forms[`form-${formKey}`].disposal.value;
      setDisposalValue(disposeSelect);
    };

    // 妊娠の状況の表示切り替え
    let pregnantSelector = null;
    if (isFemale && isAdult) {
      pregnantSelector = (
        <InfoInput
          title="妊娠の状況"
          type="select"
          name="pregnant"
          options={["なし", "あり", "不明"]}
          required={true}
          defaultValue={detail != null ? detail.妊娠の状況 : null}
          errorMessage={error.pregnant}
          onChange={validatePregnant}
        />
      );
    }

    return (
      <form name={"form-" + formKey}>
        <InfoInput
          title="幼獣・成獣の別"
          type="select"
          name="age"
          options={["幼獣", "成獣"]}
          defaultValue={detail != null ? detail.成獣幼獣別 : "幼獣"}
          onChange={onChangeAge}
        />
        <InfoInput
          title="性別"
          type="select"
          name="sex"
          options={["オス", "メス", "不明"]}
          defaultValue={detail != null ? detail.性別 : "不明"}
          onChange={onChangeSex}
        />
        <InfoInput
          title="体長 (cm)"
          type="number"
          name="length"
          min="1"
          defaultValue={detail != null ? detail.体長 : null}
          required={true}
          onChange={validateLength}
          errorMessage={error.length}
        />
        {pregnantSelector}
        <InfoInput
          title="処分方法"
          type="select"
          name="disposal"
          options={[
            "埋却",
            "焼却",
            "家保",
            "利活用（自家消費）",
            "利活用（ジビエ利用）",
            "その他（備考に記入）"
          ]}
          onChange={onChangeDispose}
          defaultValue={detail != null ? detail.処分方法 : "埋却"}
        />
        <InfoInput
          title="備考（遠沈管番号）（作業時間）"
          type="text-area"
          rows="4"
          name="note"
          defaultValue={detail != null ? detail.備考 : null}
        />
      </form>
    );
  }
);

export default BoarDetailForm;
