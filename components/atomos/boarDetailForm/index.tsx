import React, { useEffect, useImperativeHandle, useState } from "react";
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
import { fetchArea, fetchDefaultID, fetchTraders } from "../../../utils/jibie";
import { getUserData } from "../../../utils/gis";

const BoarDetailForm = React.forwardRef<BoarDetailFormHandler, BoarDetailProps>(
  ({ detail, formKey, traderInfo }, ref) => {
    const [isFemale, setFemale] = useState(
      detail != null ? detail["性別"] === "メス" : false
    );
    const [isAdult, setAdult] = useState(
      detail != null ? detail["成獣幼獣別"] === "成獣" : true
    );
    const [disposalValue, setDisposalValue] = useState<string>("");

    const [error, setError] = useState<BoarDetailFormError>({});

    const [areaList, setAreaList] = useState<string[]>([]);

    const [area, setArea] = useState<string>(
      detail != null && detail["地域"] != null
        ? detail["地域"]
        : traderInfo != null
        ? traderInfo.area
        : ""
    );

    const [trader, setTrader] = useState<string>(
      detail != null && detail["ジビエ業者"] != null
        ? detail["ジビエ業者"]
        : traderInfo != null
        ? traderInfo.trader
        : ""
    );

    const [traders, setTraders] = useState<string[]>([]);

    const [traderDefault, setTraderDefault] = useState<string>(
      detail != null && detail["個体管理番"] != null
        ? detail["個体管理番"]
        : traderInfo != null
        ? traderInfo.defaultID
        : ""
    );

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

    const validateBoarNum = async () => {
      const form = document.forms[`form-${formKey}`];
      const disposal = form.disposal.options[form.disposal.selectedIndex].value;
      // ジビエ利用ではない場合には終了する。
      if (disposal !== "利活用（ジビエ利用）") {
        await updateError("boarnum", null);
        return;
      }
      // ジビエ業者/市アカウントじゃなかったら終了する
      const boarNum = form["boarNum-" + formKey];
      const department = getUserData().department;
      if (department !== "J" && department !== "K") {
        await updateError("boarnum", null);
        return;
      }

      if (boarNum.value === null || boarNum.value === "") {
        updateError("boarnum", "入力されていません。");
        return;
      }

      const valStr = boarNum.value.split("-")[1];
      const error = checkNumberError(valStr);
      if (error != null) {
        await updateError("boarnum", error);
        return;
      }

      if (valStr.length != 3 || parseInt(valStr) < 0) {
        await updateError("boarnum", "形式が正しくありません。");
        return;
      }

      await updateError("boarnum", null);
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
      await validateBoarNum();
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
      const userDept = getUserData().department;

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

      // 処分方法
      const disposal = form.disposal.options[form.disposal.selectedIndex].value;

      // (ジビエ利用の場合はこれがtrueになる。)
      const isJibie = disposal === "利活用（ジビエ利用）";
      // 地域
      const jibieArea = isJibie ? area : "";

      // 業者
      const jibieTrader = isJibie ? trader : "";

      // 個体識別番号
      //   1. ジビエじゃなかったら空で返す
      //   2. 業者/市アカウントじゃない場合は受け取っていた場合にそのまま残す
      const jibieBoarNum = isJibie
        ? userDept === "J" || userDept === "K"
          ? document.forms[`form-${formKey}`]["boarNum-" + formKey].value
          : detail != null && detail["個体管理番"] != null
          ? detail["個体管理番"]
          : ""
        : "";

      return {
        成獣幼獣別: age,
        性別: gender,
        体長: parseInt(length),
        処分方法: disposal,
        備考: note,
        妊娠の状況: pregnant,
        地域: jibieArea,
        ジビエ業者: jibieTrader,
        個体管理番: jibieBoarNum
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

    const onChangeArea = () => {
      const areaSelect = document.forms[`form-${formKey}`].area.value;
      setArea(areaSelect);
    };

    const onChangeTrader = () => {
      const traderSelect = document.forms[`form-${formKey}`].trader.value;
      setTrader(traderSelect);
    };

    const onChangeBoarNum = async () => {
      const boarNum2 =
        document.forms[`form-${formKey}`]["boarNum-" + formKey + "_sec2"].value;
      if (boarNum2 !== "") await validateBoarNum();
    };

    if (disposalValue === "") {
      setDisposalValue(detail != null ? detail.処分方法 : "埋却");
    }

    if (area === "") {
      setArea(
        detail != null && detail.地域 != null && detail.地域 !== ""
          ? detail.地域
          : "岐阜"
      );
    }

    useEffect(() => {
      fetchTraders(area).then(list => setTraders(list));
    }, [area]);

    useEffect(() => {
      if (!traders.includes(trader) && traders.length) {
        setTrader(traders[0]);
      }
    }, [traders]);

    useEffect(() => {
      const boarNum = document.forms[`form-${formKey}`]["boarNum-" + formKey];
      if (
        detail == null ||
        (detail != null &&
          boarNum != null &&
          detail.個体管理番 !== boarNum.value)
      ) {
        fetchDefaultID(area, trader).then(def => {
          setTraderDefault(def);
        });
      }
    }, [trader]);

    useEffect(() => {
      // なんかわけわからなくなったのでとりあえずこのコードで行きます。
      const boarNum = document.forms[`form-${formKey}`]["boarNum-" + formKey];
      const boarNum1 =
        document.forms[`form-${formKey}`]["boarNum-" + formKey + "_sec1"];
      const boarNum2 =
        document.forms[`form-${formKey}`]["boarNum-" + formKey + "_sec2"];
      if (!(boarNum && boarNum1 && boarNum2)) return;
      const value = traderDefault.split("-");
      if (value.length >= 2) {
        boarNum1.value = value[0];
        boarNum2.value = value[1];
        boarNum.value = traderDefault;
      } else {
        boarNum1.value = traderDefault;
        boarNum2.value = "";
        boarNum.value = "";
      }
    }, [traderDefault]);

    if (traderDefault === "" && traders.length != 0) {
      fetchDefaultID(area, traders[0]).then(def => setTraderDefault(def));
    }

    if (!areaList.length) {
      setAreaList(fetchArea());
    }

    const userDepartment = getUserData().department;

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
        {disposalValue === "利活用（ジビエ利用）" ? (
          <>
            <InfoInput
              title="地域（農林事務所単位）"
              type="select"
              name="area"
              options={areaList}
              defaultValue={
                detail != null
                  ? detail.地域
                  : traderInfo != null
                  ? traderInfo.area
                  : "岐阜"
              }
              onChange={onChangeArea}
            />

            <InfoInput
              title="ジビエ業者"
              type="select"
              name="trader"
              options={traders}
              defaultValue={
                detail != null
                  ? detail.ジビエ業者
                  : traderInfo != null
                  ? traderInfo.trader
                  : traders[0]
              }
              onChange={onChangeTrader}
            />

            {userDepartment === "J" || userDepartment === "K" ? (
              <InfoInput
                title="個体管理番号"
                type="boar-num"
                name={"boarNum-" + formKey}
                defaultValue={traderDefault}
                onChange={onChangeBoarNum}
                required={true}
                errorMessage={error.boarnum}
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
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
