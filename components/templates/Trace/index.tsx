import "./trace.scss";
import Header from "../../organisms/header";
import RoundButton from "../../atomos/roundButton";
import TextInput from "../../atomos/textInput";
import React, { useState } from "react";
import { checkLuhn } from "../../../utils/jibie";

import { SERVER_URI } from "../../../utils/gis";
import { isError, QueryError, QueryResult } from "./interface";

const TraceTemplate: React.FunctionComponent = () => {
  const [error, setError] = useState("");
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("検索");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [searchResult, setSearchResult] = useState<
    QueryError | QueryResult | null
  >(null);

  const inputChanged = () => {
    const NUMBER_LENGTH = 9;

    const boarNo = (document.getElementById("boar_no") as HTMLInputElement)
      .value;
    if (boarNo === "") {
      // 何も入力されていない場合はエラーを消して終了する。
      setError("");
      setButtonEnabled(false);
      return;
    }

    if (Number.isNaN(Number(boarNo))) {
      // 数字以外が入力された場合にはエラーを出す。
      setError("数字以外が入力されています。");
      setButtonEnabled(false);
      return;
    }

    if (boarNo.length < NUMBER_LENGTH) {
      // 指定された桁数未満の場合は何もしない
      setError("");
      setButtonEnabled(false);
      return;
    }

    if (boarNo.length > NUMBER_LENGTH) {
      // 指定された桁数より長い場合はエラーを出す。
      setError("データの形式が不正です。");
      setButtonEnabled(false);
      return;
    }

    if (!checkLuhn(boarNo)) {
      // チェックディジットを計算して間違っている場合にはエラーを返す。
      setError("入力された値が間違っています。");
      setButtonEnabled(false);
      return;
    }

    setButtonEnabled(true);
    setError("");
  };

  const buttonClicked = async () => {
    const boarNo = (document.getElementById("boar_no") as HTMLInputElement)
      .value;

    setInputDisabled(true);
    setButtonEnabled(false);
    setButtonLabel("検索中...");

    const data = {
      check_no: boarNo
    };

    const result = await fetch(SERVER_URI + "/v2/SearchById", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      mode: "cors",
      credentials: "include",
      body: JSON.stringify(data)
    });

    const response = await result.json();
    if (result.status === 200) {
      setSearchResult(response as QueryResult);
    } else {
      response.status = result.status;
      setSearchResult(response as QueryError);
    }

    setInputDisabled(false);
    setButtonEnabled(true);
    setButtonLabel("検索");
  };

  return (
    <div className="trace">
      <Header color="primary" guest={true}>
        個体検索
      </Header>

      <div className="trace__contents">
        <div className="trace-form__title">検索条件</div>
        <div className="trace-form__form">
          <div className="trace-form__form__grid">
            <div className="trace-form__form__grid__title trace-form__form__grid__date">
              確認番号
            </div>
            <div className="trace-form__form__grid__input trace-form__form__grid__date">
              <TextInput
                id="boar_no"
                required={true}
                onChange={inputChanged}
                disabled={inputDisabled}
              />
              <div className="trace-form__form__error">{error}</div>
            </div>
          </div>
          <div className="trace-form__form__grid__button-div">
            <div className="trace-form__form__grid__button-div__button">
              <RoundButton bind={buttonClicked} enabled={buttonEnabled}>
                {buttonLabel}
              </RoundButton>
            </div>
          </div>
        </div>
        <div className="trace__contents__footer-adjuster"></div>
        {searchResult === null ? (
          <></>
        ) : isError(searchResult) ? (
          <div className="trace__contents__error">
            {searchResult.status === 500 ? (
              <span className="trace__contents__error__text">
                サーバー側でエラーが発生しました。
              </span>
            ) : (
              <></>
            )}
            <span className="trace__contents__error__text">
              {searchResult.reason}
            </span>
          </div>
        ) : (
          <>
            <div className="trace-form__title">検索結果</div>
            <div className="trace__contents__table">
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">確認番号</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.check_no}
                </li>
              </ul>
              <ul className="trace__contents__table__data trace__contents__table__data__bottom">
                <li className="trace__contents__table__data__key">
                  個体管理番号
                </li>
                <li className="trace__contents__table__data__value">
                  {searchResult.id}
                </li>
              </ul>
              <div className="trace__contents__table__data__spacer"></div>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">市町村</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.city}
                </li>
              </ul>
              <ul className="trace__contents__table__data trace__contents__table__data__bottom">
                <li className="trace__contents__table__data__key">地名</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.area}
                </li>
              </ul>

              <div className="trace__contents__table__data__spacer"></div>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">捕獲日</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.date.split(" ")[0]}
                </li>
              </ul>
              <ul className="trace__contents__table__data trace__contents__table__data__bottom">
                <li className="trace__contents__table__data__key">捕獲区分</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.division}
                </li>
              </ul>

              <div className="trace__contents__table__data__spacer"></div>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">性別</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.gender}
                </li>
              </ul>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">成子の別</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.is_child ? "幼獣" : "成獣"}
                </li>
              </ul>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">体長</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.length} cm
                </li>
              </ul>
              <ul className="trace__contents__table__data trace__contents__table__data__bottom">
                <li className="trace__contents__table__data__key">体重</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.weight} kg
                </li>
              </ul>

              <div className="trace__contents__table__data__spacer"></div>
              <ul className="trace__contents__table__data">
                <li className="trace__contents__table__data__key">PCR検査日</li>
                <li className="trace__contents__table__data__value">
                  {searchResult.pcr_date.split(" ")[0]}
                </li>
              </ul>
              <ul className="trace__contents__table__data trace__contents__table__data__bottom">
                <li className="trace__contents__table__data__key">
                  PCR検査結果
                </li>
                <li className="trace__contents__table__data__value">
                  {searchResult.pcr_result}
                </li>
              </ul>
            </div>
          </>
        )}
        <div className="copyright">
          <span>(c) 2019-2021 National Institute of Technology, </span>
          <span>Gifu College GIS Team</span>
        </div>
      </div>
    </div>
  );
};

export default TraceTemplate;
