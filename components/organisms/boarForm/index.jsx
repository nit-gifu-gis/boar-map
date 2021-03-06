import "./boarForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React from "react";
import InfoInput from "../../molecules/infoInput";
import "../../../utils/validateData";
import "../../../utils/dict";
import { getUserData, hasWritePermission } from "../../../utils/gis";
import { alert } from "../../../utils/modals";

const TRAP = 1;
const ENV = 2;

class BoarForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trapOrEnv: TRAP,
      trapValue: "くくりわな",
      envValue: "山際",
      lat: props.lat,
      lng: props.lng,
      detail: null,
      error: {
        date: null,
        meshNo: null,
        length: null,
        pregnant: null,
        childrenNum: null,
        adultsNum: null
      },
      isFemale: false,
      isAdult: false,
      isBox: false
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
    this.updateError.bind(this);
    this.validateDate.bind(this);
    this.validateMeshNo.bind(this);
    this.validateLength.bind(this);
    this.validateDetail.bind(this);
    this.validatePregnant.bind(this);
    this.validateEachCatchNum.bind(this);
    this.validateCatchNum.bind(this);
  }

  async componentDidMount() {
    // T, U, S, K, R以外は登録不可
    if (!hasWritePermission("boar")) {
      await alert("Permission Denied: この情報にはアクセスできません");
      Router.push("/map");
      return;
    }

    // detailが与えられた場合
    if (this.state.detail != null) {
      const detail = this.state.detail;
      const division = detail["properties"]["区分"];
      switch (division) {
        case "死亡":
          this.setState(_ => {
            return {
              trapOrEnv: ENV,
              envValue: detail["properties"]["罠・発見場所"]
            };
          });
          break;
        default:
          this.setState(_ => {
            return {
              trapOrEnv: TRAP,
              trapValue: detail["properties"]["罠・発見場所"]
            };
          });
          break;
      }
      this.setState({ isFemale: detail["properties"]["性別"] === "メス" });
      this.setState({ isAdult: detail["properties"]["幼獣・成獣"] === "成獣" });
      this.setState({
        isBox: detail["properties"]["罠・発見場所"] === "箱わな"
      });
      this.setState({ isAdult: detail["properties"]["幼獣・成獣"] === "成獣" });
    }
  }

  async updateError(key, value) {
    const e = deepClone(this.state.error);
    e[key] = value;
    this.setState({ error: e });
  }

  // バリデーション
  async validateMeshNo() {
    const form = document.forms.form;
    const meshNo = form.meshNo.value;
    // データが無いならエラー
    if (meshNo === "") {
      await this.updateError("meshNo", "入力されていません。");
    } else {
      await this.updateError("meshNo", null);
    }
  }

  async validateDate() {
    const form = document.forms.form;
    const dateStr = form.date.value;
    const error = checkDateError(dateStr);
    if (error != null) {
      await this.updateError("date", error);
      return;
    }
    await this.updateError("date", null);
  }

  async validateLength() {
    const form = document.forms.form;
    const length = form.length.value;
    const error = checkNumberError(length);
    if (error != null) {
      await this.updateError("length", error);
      return;
    }
    const length_num = parseFloat(length);
    if (length_num <= 0) {
      await this.updateError("length", "0以下の数値が入力されています。");
      return;
    }
    await this.updateError("length", null);
  }

  async validatePregnant() {
    if (!this.state.isFemale) {
      // メスじゃない場合はエラーを消して終了
      await this.updateError("pregnant", null);
      return;
    }
    // メスの場合
    if (!this.state.isAdult) {
      // 成獣じゃない場合はエラーを消して終了
      await this.updateError("pregnant", null);
      return;
    }
    // メスかつ成獣の場合
    const form = document.forms.form;
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
      await this.updateError("pregnant", null);
    } else {
      await this.updateError("pregnant", "選択されていません。");
    }
    return;
  }

  async validateEachCatchNum(name) {
    // 捕獲頭数の個々の数を検証
    if (!this.state.isBox) {
      // 箱わなが選択されていない場合はnull
      await this.updateError(name, null);
      return;
    }

    const form = document.forms.form;
    const numStr = form[name].value;
    const error = checkNumberError(numStr);
    if (error != null) {
      await this.updateError(name, error);
      return false;
    }

    // 0以上か検証
    const num = parseFloat(numStr);
    if (num < 0) {
      await this.updateError(name, "負の数が入力されています。");
      return false;
    }

    // それ以外ならエラーなし
    await this.updateError(name, null);
    return true;
  }

  // 捕獲頭数の合計をチェック
  async validateCatchNum() {
    if (!this.state.isBox) {
      // 箱わなが選択されていない場合はnull
      await this.updateError("childrenNum", null);
      await this.updateError("adultsNum", null);
      return;
    }
    // すでにエラーがある場合は検証しない
    const cError = await this.validateEachCatchNum("childrenNum");
    const aError = await this.validateEachCatchNum("adultsNum");
    if (!cError || !aError) {
      return;
    }
    // 足す
    const form = document.forms.form;
    const childrenNum = parseInt(form["childrenNum"].value);
    const adultsNum = parseInt(form["adultsNum"].value);
    const catchNum = childrenNum + adultsNum;
    if (catchNum <= 0) {
      await this.updateError("childrenNum", "捕獲頭数の合計が0以下です。");
      await this.updateError("adultsNum", "捕獲頭数の合計が0以下です。");
      return;
    }
  }

  // バリデーションをする
  async validateDetail() {
    // 全部チェックしていく
    await this.validateMeshNo();
    await this.validateDate();
    await this.validateLength();
    await this.validatePregnant();
    await this.validateEachCatchNum("childrenNum");
    await this.validateEachCatchNum("adultsNum");
    await this.validateCatchNum();

    // エラー一覧を表示
    let valid = true;
    Object.keys(this.state.error).forEach(key => {
      if (this.state.error[key] != null) {
        console.error(this.state.error[key]);
        valid = false;
      }
    });
    return valid;
  }

  // データを作る
  createDetail() {
    const form = document.forms.form;
    // 送信に必要な情報を集めておく
    // 0 入力者
    const user = getUserData().userId;
    // 0-1 メッシュ番号
    const meshNo = form.meshNo.value;
    // 1 区分
    const division = form.division.options[form.division.selectedIndex].value;
    // 2 捕獲年月日
    const date = form.date.value;
    // // 3 位置情報
    const lat = this.state.lat;
    const lng = this.state.lng;
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
    if (this.state.isBox) {
      childrenNum = parseInt(form.childrenNum.value);
      adultsNum = parseInt(form.adultsNum.value);
      catchNum = childrenNum + adultsNum;
    }
    // 4-1 幼獣・成獣の別
    const age = form.age.options[form.age.selectedIndex].value;
    if (!this.state.isBox) {
      catchNum = 1;
      childrenNum = age === "幼獣" ? 1 : 0;
      adultsNum = age === "成獣" ? 1 : 0;
    }
    // 5 性別
    const sex = form.sex.options[form.sex.selectedIndex].value;
    // 6 体長
    const length = form.length.value;
    // 6-1 妊娠の状況
    let pregnant = "";
    if (this.state.isFemale && this.state.isAdult) {
      pregnant = form.pregnant.options[form.pregnant.selectedIndex].value;
    }
    // 6-2 処分方法
    const disposal = form.disposal.options[form.disposal.selectedIndex].value;
    // 7 体重
    const weight = this.weigh(Number(length));
    // 7-1 備考
    const note = form.note.value;
    // 8 歯列画像
    // 9 現地写真

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      properties: {
        入力者: user,
        メッシュ番号: meshNo,
        区分: division,
        捕獲年月日: date,
        位置情報: "(" + lat + "," + lng + ")",
        "罠・発見場所": trapOrEnv,
        捕獲頭数: catchNum,
        幼獣の頭数: childrenNum,
        成獣の頭数: adultsNum,
        "幼獣・成獣": age,
        性別: sex,
        体長: length,
        体重: weight,
        妊娠の状況: pregnant,
        処分方法: disposal,
        備考: note
      }
    };
  }

  // 区分が変更されたときに呼ばれる
  onChangeDivision() {
    const divisonSelect = document.forms.form.division;
    const division = divisonSelect.options[divisonSelect.selectedIndex].value;
    switch (division) {
      case "死亡":
        this.setState(_ => {
          return { trapOrEnv: ENV, isBox: false };
        });
        break;
      default:
        this.setState(_ => {
          return { trapOrEnv: TRAP };
        });
        break;
    }
  }

  // 性別が変更されたときに呼ばれる
  onChangeSex() {
    const sexSelect = document.forms.form.sex;
    const sex = sexSelect.options[sexSelect.selectedIndex].value;
    switch (sex) {
      case "メス":
        this.setState({ isFemale: true });
        break;
      default:
        this.setState({ isFemale: false });
        break;
    }
  }

  // 幼獣・成獣の別が変更された時に呼ばれる
  onChangeAge() {
    const ageSelect = document.forms.form.age;
    const age = ageSelect.options[ageSelect.selectedIndex].value;
    switch (age) {
      case "成獣":
        this.setState({ isAdult: true });
        break;
      default:
        this.setState({ isAdult: false });
        break;
    }
  }

  // わなの種類を変更した際に呼ばれる
  onChangeTrap() {
    const trapSelect = document.forms.form.trap;
    const trap = trapSelect.options[trapSelect.selectedIndex].value;
    this.setState({ trapValue: trap });
    switch (trap) {
      case "箱わな":
        this.setState({ isBox: true });
        break;
      default:
        this.setState({ isBox: false });
        break;
    }
  }

  // 発見場所を変更した時に呼ばれる
  onChangeEnv() {
    const envSelect = document.forms.form.env;
    const env = envSelect.options[envSelect.selectedIndex].value;
    this.setState({ envValue: env });
  }

  // 体長を体重に変換する
  weigh(length) {
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
  }

  onSubmit(e) {
    // エンターキーで送信されるのを防ぐ
    e.preventDefault();
  }

  render() {
    console.log("isBox", this.state.isBox);
    if (this.state.lat != undefined && this.state.lng != undefined) {
      // わな・発見場所の切り替え
      let trapOrEnvSelector = (
        <InfoInput
          title="わなの種類"
          type="select"
          name="trap"
          options={["くくりわな", "箱わな", "その他"]}
          defaultValue={this.state.trapValue}
          onChange={this.onChangeTrap.bind(this)}
        />
      );
      if (this.state.trapOrEnv === ENV) {
        trapOrEnvSelector = (
          <InfoInput
            title="発見場所"
            type="select"
            name="env"
            options={["山際", "山地", "その他"]}
            defaultValue={this.state.envValue}
            onChange={this.onChangeEnv.bind(this)}
          />
        );
      }
      // 妊娠の状況の表示切り替え
      let pregnantSelector = null;
      if (this.state.isFemale && this.state.isAdult) {
        pregnantSelector = (
          <InfoInput
            title="妊娠の状況"
            type="select"
            name="pregnant"
            options={["なし", "あり", "不明"]}
            required={true}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["妊娠の状況"]
                : null
            }
            errorMessage={this.state.error.pregnant}
            onChange={this.validatePregnant.bind(this)}
          />
        );
      }
      // 捕獲頭数の表示切り替え
      let catchNumInput = null;
      if (this.state.isBox) {
        catchNumInput = [
          <InfoInput
            title="幼獣の頭数"
            type="number"
            name="childrenNum"
            min="0"
            required={true}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["幼獣の頭数"]
                : null
            }
            onChange={this.validateEachCatchNum.bind(this, "childrenNum")}
            errorMessage={this.state.error.childrenNum}
          />,
          <InfoInput
            title="成獣の頭数"
            type="number"
            name="adultsNum"
            min="0"
            required={true}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["成獣の頭数"]
                : null
            }
            onChange={this.validateEachCatchNum.bind(this, "adultsNum")}
            errorMessage={this.state.error.adultsNum}
          />,
          <p className="boar-form__description">
            ※以下の項目については、血液を採取した個体の情報を入力してください。
          </p>
        ];
      }
      return (
        <div className="boar-form">
          <div className="form">
            <form name="form" onSubmit={this.onSubmit}>
              <InfoInput
                title="画像"
                type="images"
                name="boarImage"
                onChange={this.props.onChangedImages}
                objectURLs={this.props.objectURLs}
                imageIDs={this.props.imageIDs}
                featureType="boar"
                onDeleteServerImage={this.props.onDeleteServerImage}
              />
              <InfoInput
                title="メッシュ番号"
                type="mesh-num"
                name="meshNo"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["メッシュ番号"]
                    : null
                }
                lat={this.state.lat}
                lng={this.state.lng}
                required={true}
                onChange={this.validateMeshNo.bind(this)}
                errorMessage={this.state.error.meshNo}
              />
              <InfoInput
                title="区分"
                type="select"
                name="division"
                options={["調査捕獲", "有害捕獲", "死亡", "狩猟", "その他"]}
                onChange={this.onChangeDivision.bind(this)}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["区分"]
                    : null
                }
              />
              <InfoInput
                title="捕獲年月日"
                type="date"
                name="date"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["捕獲年月日"]
                    : null
                }
                onChange={this.validateDate.bind(this)}
                errorMessage={this.state.error.date}
                required={true}
              />
              {trapOrEnvSelector}
              {catchNumInput}
              <InfoInput
                title="幼獣・成獣の別"
                type="select"
                name="age"
                options={["幼獣", "成獣"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["幼獣・成獣"]
                    : "幼獣"
                }
                onChange={this.onChangeAge.bind(this)}
              />
              <InfoInput
                title="性別"
                type="select"
                name="sex"
                options={["オス", "メス", "不明"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["性別"]
                    : "不明"
                }
                onChange={this.onChangeSex.bind(this)}
              />
              <InfoInput
                title="体長 (cm)"
                type="number"
                name="length"
                min="1"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["体長"]
                    : null
                }
                required={true}
                onChange={this.validateLength.bind(this)}
                errorMessage={this.state.error.length}
              />
              {pregnantSelector}
              <InfoInput
                title="処分方法"
                type="select"
                name="disposal"
                options={["埋設", "焼却", "家保", "利活用", "その他"]}
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["処分方法"]
                    : "埋設"
                }
              />
              <InfoInput
                title="備考（遠沈管番号）（作業時間）"
                type="text-area"
                rows="4"
                name="note"
                defaultValue={
                  this.state.detail != null
                    ? this.state.detail["properties"]["備考"]
                    : null
                }
              />
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="boar-form">
          <h1>情報取得中...</h1>
        </div>
      );
    }
  }
}

export default BoarForm;
