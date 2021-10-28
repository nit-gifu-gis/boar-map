import "./boarForm.scss";
import "../../../public/static/css/global.scss";
import Router from "next/router";
import React, { useRef } from "react";
import InfoInput from "../../molecules/infoInput";
import "../../../utils/validateData";
import { deepClone } from "../../../utils/dict";
import { getUserData, hasWritePermission } from "../../../utils/gis";
import { alert } from "../../../utils/modals";
import BoarDetailForm from "../../atomos/boarDetailForm";
import Divider from "../../atomos/divider";
import { makeRandStr } from "../../../utils/randStr";

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
      isBox: false,
      details: [],
      hiddenDetails: [],
      ref: null
    };
    // データが与えられた場合は保存しておく
    if (props.detail != null) {
      this.state.detail = props.detail;
    }
    this.updateError.bind(this);
    this.validateDate.bind(this);
    this.validateMeshNo.bind(this);
    this.validateDetail.bind(this);
    this.validateEachCatchNum.bind(this);
    this.validateCatchNum.bind(this);
  }

  async componentDidMount() {
    // T, U, S, K, R以外は登録不可
    if (!hasWritePermission("boar2")) {
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
      this.setState({
        isBox: detail["properties"]["罠・発見場所"] === "箱わな"
      });
      const data = detail["properties"]["捕獲いのしし情報"];
      const details = [];
      for (let i = 0; i < data.length; i++) {
        const r = React.createRef();
        const key = makeRandStr(10);
        details.push({
          ref: r,
          obj: (
            <BoarDetailForm ref={r} detail={data[i]} key={key} formKey={key} />
          )
        });
      }
      this.setState({
        details: details
      });
    } else {
      const r = React.createRef();
      const key = makeRandStr(10);
      this.setState({
        details: [
          {
            ref: r,
            obj: <BoarDetailForm ref={r} key={key} formKey={key} />
          }
        ]
      });
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
      await this.updateError("catchNum", null);
      return;
    }
    // すでにエラーがある場合は検証しない
    const cError = await this.validateEachCatchNum("catchNum");
    if (!cError) {
      return;
    }
    // 足す
    const form = document.forms.form;
    const catchNum = parseInt(form["catchNum"].value);
    if (catchNum <= 0) {
      await this.updateError("catchNum", "捕獲頭数の合計が0以下です。");
      return;
    }

    if (this.state.details.length == catchNum) {
      // 要素数に変更がないので更新しない
      return;
    }
    const boarForm = this.getNewBoarInputForm();
    this.setState({
      details: boarForm[0],
      hiddenDetails: boarForm[1]
    });
  }

  // バリデーションをする
  async validateDetail() {
    // 全部チェックしていく
    await this.validateMeshNo();
    await this.validateDate();
    await this.validateCatchNum();

    // エラー一覧を表示
    let valid = true;
    Object.keys(this.state.error).forEach(key => {
      if (this.state.error[key] != null) {
        console.error(this.state.error[key]);
        valid = false;
      }
    });

    for (let i = 0; i < this.state.details.length; i++) {
      console.log(v);
      const v = this.state.details[i];
      if (!(await v.ref.current.validateData())) {
        valid = false;
      }
    }
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

    const boarList = [];
    for (let i = 0; i < this.state.details.length; i++) {
      const v = this.state.details[i].ref.current;
      const data = v.fetchData();
      data.枝番 = i + 1;
      data.体重 = this.weigh(data.体長);
      boarList.push(data);
    }

    // 4-0-1 捕獲頭数
    const catchNum = boarList.length;

    // 6-2 処分方法
    const disposal = boarList.length == 0 ? "不明" : boarList[0].処分方法;

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
        "罠・発見場所": trapOrEnv,
        捕獲頭数: catchNum,
        歯列写真ID: "",
        処分方法: disposal,
        捕獲いのしし情報: boarList
      }
    };
  }

  getNewBoarInputForm() {
    const form = document.forms.form;
    const catchNum = !this.state.isBox ? 1 : parseInt(form["catchNum"].value);
    if (this.state.details.length == catchNum) {
      // 数が変わらないので何もしない
      return [this.state.details, this.state.hiddenDetails];
    }

    // 配列のコピー
    const newDetails = this.state.details.slice();
    const newHiddens = this.state.hiddenDetails.slice();

    // detailにhiddenから追加するか新規に生成するか
    // (数の入力途中に消えないようにいい感じに)
    while (newDetails.length < catchNum) {
      if (newHiddens.length < 0) {
        // hiddensから取り出し
        newDetails.push(newHiddens.shift());
      } else {
        // 新規追加
        const r = React.createRef();
        const key = makeRandStr(10);
        newDetails.push({
          ref: r,
          obj: <BoarDetailForm ref={r} key={key} formKey={key} />
        });
      }
    }

    // detailからhiddenに移動
    while (newDetails.length > catchNum) {
      newHiddens.unshift(newDetails.pop());
    }

    return [newDetails, newHiddens];
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

  // わなの種類を変更した際に呼ばれる
  onChangeTrap() {
    const trapSelect = document.forms.form.trap;
    const trap = trapSelect.options[trapSelect.selectedIndex].value;
    this.setState({ trapValue: trap });
    const boarForm = this.getNewBoarInputForm();
    this.setState({ details: boarForm[0], hiddenDetails: boarForm[1] });
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
      // 捕獲頭数の表示切り替え
      let catchNumInput = null;
      if (this.state.isBox) {
        catchNumInput = [
          <InfoInput
            title="捕獲頭数"
            type="number"
            name="catchNum"
            min="0"
            required={true}
            defaultValue={
              this.state.detail != null
                ? this.state.detail["properties"]["捕獲頭数"]
                : null
            }
            onChange={this.validateCatchNum.bind(this)}
            errorMessage={this.state.error.catchNum}
          />,
          <p className="boar-form__description">
            ※以下に捕獲した個体の情報について入力してください。
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
              {this.state.details.map((v, index) => {
                return (
                  <>
                    {index > 0 ? <Divider /> : <></>}
                    {this.state.details.length > 1 ? (
                      <div className="boar-form__nthbody">
                        <div className="text">{index + 1}体目</div>
                      </div>
                    ) : (
                      <></>
                    )}
                    {v.obj}
                  </>
                );
              })}
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
